import pytest
from pydantic import ValidationError

from app.schemas.analyze import (
    AnalyzeErrorResponse,
    AnalyzeSuccessResponse,
    Detection,
    ErrorCode,
    ErrorDetail,
)


def test_success_response_matches_api_contract() -> None:
    response = AnalyzeSuccessResponse(
        detections=[
            Detection(class_name="Person", confidence=0.96),
            Detection(class_name="Helmet", confidence=0.91),
        ]
    )

    assert response.model_dump(mode="json", by_alias=True) == {
        "success": True,
        "detections": [
            {"class": "Person", "confidence": 0.96},
            {"class": "Helmet", "confidence": 0.91},
        ],
    }


@pytest.mark.parametrize("confidence", [-0.01, 1.01])
def test_detection_rejects_confidence_outside_zero_to_one(confidence: float) -> None:
    with pytest.raises(ValidationError):
        Detection(class_name="Person", confidence=confidence)


def test_error_response_matches_api_contract() -> None:
    response = AnalyzeErrorResponse(
        error=ErrorDetail(
            code=ErrorCode.INVALID_IMAGE,
            message="Geçersiz veya desteklenmeyen görsel.",
        )
    )

    assert response.model_dump(mode="json") == {
        "success": False,
        "error": {
            "code": "INVALID_IMAGE",
            "message": "Geçersiz veya desteklenmeyen görsel.",
        },
    }


def test_response_discriminators_cannot_be_changed() -> None:
    with pytest.raises(ValidationError):
        AnalyzeSuccessResponse(success=False, detections=[])

    with pytest.raises(ValidationError):
        AnalyzeErrorResponse(
            success=True,
            error=ErrorDetail(code=ErrorCode.INTERNAL_ERROR, message="Beklenmeyen hata."),
        )
