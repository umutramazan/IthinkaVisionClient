import hashlib
import json
from pathlib import Path

import pytest

from docker.entrypoint import verify_model


def test_verify_model_writes_structured_success_log(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    model_path = tmp_path / "best.onnx"
    model_bytes = b"valid-model"
    model_path.write_bytes(model_bytes)
    expected_sha256 = hashlib.sha256(model_bytes).hexdigest()
    monkeypatch.setenv("APP_MODEL_PATH", str(model_path))
    monkeypatch.setenv("APP_MODEL_SHA256", expected_sha256)

    verify_model()

    captured = capsys.readouterr()
    payload = json.loads(captured.out)
    assert captured.err == ""
    assert payload["level"] == "INFO"
    assert payload["logger"] == "container.entrypoint"
    assert payload["event"] == "model_checksum_verified"
    assert payload["model_path"] == str(model_path)
    assert payload["model_sha256"] == expected_sha256
    assert payload["timestamp"].endswith("+00:00")


def test_verify_model_writes_structured_mismatch_error(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    model_path = tmp_path / "best.onnx"
    model_path.write_bytes(b"unexpected-model")
    monkeypatch.setenv("APP_MODEL_PATH", str(model_path))
    monkeypatch.setenv("APP_MODEL_SHA256", "0" * 64)

    with pytest.raises(SystemExit, match="1"):
        verify_model()

    captured = capsys.readouterr()
    payload = json.loads(captured.err)
    assert captured.out == ""
    assert payload["level"] == "ERROR"
    assert payload["logger"] == "container.entrypoint"
    assert payload["event"] == "model_checksum_mismatch"
    assert payload["expected_model_sha256"] == "0" * 64
    assert payload["actual_model_sha256"] == hashlib.sha256(b"unexpected-model").hexdigest()
