import asyncio
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import Request, UploadFile
from fastapi.testclient import TestClient
from PIL import Image
from starlette.datastructures import Headers

from app.api.v1.analyze import analyze_image
from app.config.settings import Settings
from app.inference.base_model import BaseModel
from app.main import create_app
from app.schemas.analyze import Detection
from app.services.analysis import AnalysisService
from app.services.image_validation import ImageValidationError


def make_image(image_format: str = "JPEG") -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


class FakeDetectionModel(BaseModel):
    def predict(self, image_bytes: bytes) -> list[Detection]:
        return [
            Detection(class_name="Person", confidence=0.96),
            Detection(class_name="Helmet", confidence=0.91),
        ]


def make_request() -> tuple[Request, AnalysisService]:
    service = AnalysisService(FakeDetectionModel(), max_concurrency=1)
    request = cast(
        Request,
        SimpleNamespace(
            app=SimpleNamespace(
                state=SimpleNamespace(
                    settings=Settings(log_level="CRITICAL"),
                    analysis_service=service,
                )
            )
        ),
    )
    return request, service


@pytest.mark.parametrize(
    ("model_type", "content", "content_type", "status_code", "error_code"),
    [
        ("classification", make_image(), "image/jpeg", 400, "INVALID_MODEL_TYPE"),
        ("detection", make_image("PNG"), "image/gif", 415, "UNSUPPORTED_IMAGE_TYPE"),
        ("detection", b"not-an-image", "image/jpeg", 400, "INVALID_IMAGE"),
    ],
)
def test_analysis_errors_use_standard_contract(
    client: TestClient,
    model_type: str,
    content: bytes,
    content_type: str,
    status_code: int,
    error_code: str,
) -> None:
    response = client.post(
        "/api/v1/analyze",
        data={"modelType": model_type},
        files={"image": ("sample", content, content_type)},
    )

    assert response.status_code == status_code
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == error_code
    assert response.json()["error"]["message"]


def test_missing_form_field_uses_standard_contract(client: TestClient) -> None:
    response = client.post("/api/v1/analyze", data={"modelType": "detection"})

    assert response.status_code == 422
    assert response.json() == {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "İstek alanları eksik veya geçersiz.",
        },
    }


def test_missing_model_type_uses_standard_contract(client: TestClient) -> None:
    response = client.post(
        "/api/v1/analyze",
        files={"image": ("sample.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 422
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_upload_larger_than_configured_limit_is_rejected() -> None:
    app = create_app(Settings(max_upload_size_mb=1, log_level="CRITICAL"))

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("large.jpg", b"a" * (1024 * 1024 + 1), "image/jpeg")},
        )

    assert response.status_code == 413
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == "IMAGE_TOO_LARGE"


def test_unexpected_error_does_not_leak_exception_details() -> None:
    app = create_app(Settings(env="development", log_level="CRITICAL"))

    with (
        patch(
            "app.services.analysis.AnalysisService.analyze",
            new=AsyncMock(side_effect=RuntimeError("sensitive detail")),
        ),
        TestClient(app, raise_server_exceptions=False) as client,
    ):
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("sample.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 500
    assert response.json() == {
        "success": False,
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "Beklenmeyen bir sunucu hatası oluştu.",
        },
    }
    assert "sensitive detail" not in response.text


def test_upload_is_closed_when_validation_fails() -> None:
    upload = UploadFile(
        filename="sample.jpg",
        file=BytesIO(make_image()),
        headers=Headers({"content-type": "image/jpeg"}),
    )
    request, service = make_request()

    async def call_endpoint() -> None:
        with pytest.raises(ImageValidationError):
            await analyze_image(request, upload, "classification")

    try:
        asyncio.run(call_endpoint())
    finally:
        service.close()

    assert upload.file.closed


def test_upload_is_closed_when_analysis_succeeds() -> None:
    upload = UploadFile(
        filename="sample.jpg",
        file=BytesIO(make_image()),
        headers=Headers({"content-type": "image/jpeg"}),
    )
    request, service = make_request()

    try:
        response = asyncio.run(analyze_image(request, upload, "detection"))
    finally:
        service.close()

    assert response.success is True
    assert upload.file.closed


def test_analysis_does_not_create_persistent_files(
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.chdir(tmp_path)

    response = client.post(
        "/api/v1/analyze",
        data={"modelType": "detection"},
        files={"image": ("sample.jpg", make_image(), "image/jpeg")},
    )

    assert response.status_code == 200
    assert list(tmp_path.iterdir()) == []


def test_successful_analysis_produces_technical_log(client: TestClient) -> None:
    with patch("app.api.v1.analyze.logger.info") as log_info:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("private-name.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 200
    log_info.assert_called_once()
    assert "private-name.jpg" not in str(log_info.call_args)


def test_failed_analysis_produces_technical_log(client: TestClient) -> None:
    with patch("app.core.exception_handlers.logger.warning") as log_warning:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "classification"},
            files={"image": ("private-name.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 400
    log_warning.assert_called_once()
    assert "private-name.jpg" not in str(log_warning.call_args)
