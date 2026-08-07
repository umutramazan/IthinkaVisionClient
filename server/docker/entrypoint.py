from __future__ import annotations

import hashlib
import os
import sys
from pathlib import Path


def verify_model() -> None:
    model_path = Path(os.environ.get("APP_MODEL_PATH", "/models/best.onnx"))
    expected_sha256 = os.environ.get("APP_MODEL_SHA256", "").strip().lower()

    if not model_path.is_file():
        raise SystemExit(f"Model dosyasi bulunamadi: {model_path}")
    if not expected_sha256:
        raise SystemExit("APP_MODEL_SHA256 tanimlanmadi")

    with model_path.open("rb") as model_file:
        digest = hashlib.file_digest(model_file, "sha256").hexdigest()
    if digest != expected_sha256:
        raise SystemExit(
            f"Model SHA-256 dogrulamasi basarisiz: beklenen={expected_sha256} gercek={digest}"
        )

    print(f"Model SHA-256 dogrulandi: {digest}", flush=True)


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
