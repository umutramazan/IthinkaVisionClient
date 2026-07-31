from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ErrorCode(StrEnum):
    INVALID_IMAGE = "INVALID_IMAGE"
    INVALID_MODEL_TYPE = "INVALID_MODEL_TYPE"
    UNSUPPORTED_IMAGE_TYPE = "UNSUPPORTED_IMAGE_TYPE"
    IMAGE_TOO_LARGE = "IMAGE_TOO_LARGE"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class Detection(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    class_name: str = Field(alias="class", min_length=1)
    confidence: float = Field(ge=0.0, le=1.0)


class AnalyzeSuccessResponse(BaseModel):
    success: Literal[True] = True
    detections: list[Detection]


class ErrorDetail(BaseModel):
    code: ErrorCode
    message: str = Field(min_length=1)


class AnalyzeErrorResponse(BaseModel):
    success: Literal[False] = False
    error: ErrorDetail
