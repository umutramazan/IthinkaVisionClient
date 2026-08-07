from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import UTC, datetime
from pathlib import Path


def write_log(level: str, event: str, message: str, **fields: object) -> None:
    payload = {
        "timestamp": datetime.now(UTC).isoformat(timespec="milliseconds"),
        "level": level,
        "logger": "container.entrypoint",
        "event": event,
        "message": message,
        "request_id": "-",
        **fields,
    }
    stream = sys.stderr if level in {"ERROR", "CRITICAL"} else sys.stdout
    print(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":"), default=str),
        file=stream,
        flush=True,
    )


def verify_model() -> None:
    model_path = Path(os.environ.get("APP_MODEL_PATH", "/models/best.onnx"))
    expected_sha256 = os.environ.get("APP_MODEL_SHA256", "").strip().lower()

    if not model_path.is_file():
        write_log(
            "ERROR",
            "model_file_missing",
            "Model dosyası bulunamadı",
            model_path=model_path,
        )
        raise SystemExit(1)
    if not expected_sha256:
        write_log(
            "ERROR",
            "model_checksum_missing",
            "Beklenen model SHA-256 değeri tanımlanmadı",
            model_path=model_path,
        )
        raise SystemExit(1)

    with model_path.open("rb") as model_file:
        digest = hashlib.file_digest(model_file, "sha256").hexdigest()
    if digest != expected_sha256:
        write_log(
            "ERROR",
            "model_checksum_mismatch",
            "Model SHA-256 doğrulaması başarısız",
            model_path=model_path,
            expected_model_sha256=expected_sha256,
            actual_model_sha256=digest,
        )
        raise SystemExit(1)

    write_log(
        "INFO",
        "model_checksum_verified",
        "Model SHA-256 doğrulandı",
        model_path=model_path,
        model_sha256=digest,
    )


def run_server() -> None:
    host = os.environ.get("APP_HOST", "0.0.0.0")
    port = os.environ.get("APP_PORT", "8000")
    log_level = os.environ.get("APP_LOG_LEVEL", "INFO").lower()

    os.execvp(
        sys.executable,
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            host,
            "--port",
            port,
            "--log-level",
            log_level,
        ],
    )


if __name__ == "__main__":
    verify_model()
    run_server()
