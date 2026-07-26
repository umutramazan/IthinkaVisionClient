import asyncio
from io import BytesIO

import pytest
from fastapi import UploadFile
from PIL import Image

from app.schemas.analyze import ErrorCode
from app.services.image_validation import (
    ImageValidationError,
    read_upload_with_limit,
    validate_image_content,
    validate_model_type,
)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}


def make_image(image_format: str) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


@pytest.mark.parametrize(
    ("image_format", "content_type"),
    [("JPEG", "image/jpeg"), ("PNG", "image/png")],
)
def test_valid_image_content_is_accepted(image_format: str, content_type: str) -> None:
    validate_image_content(make_image(image_format), content_type, ALLOWED_MIME_TYPES)


def test_only_detection_model_type_is_accepted() -> None:
    validate_model_type("detection")

    with pytest.raises(ImageValidationError) as exc_info:
        validate_model_type("classification")

    assert exc_info.value.code is ErrorCode.INVALID_MODEL_TYPE


def test_unsupported_mime_type_is_rejected() -> None:
    with pytest.raises(ImageValidationError) as exc_info:
        validate_image_content(make_image("PNG"), "image/gif", ALLOWED_MIME_TYPES)

    assert exc_info.value.code is ErrorCode.UNSUPPORTED_IMAGE_TYPE


def test_decode_failure_is_rejected() -> None:
    with pytest.raises(ImageValidationError) as exc_info:
        validate_image_content(b"not-an-image", "image/jpeg", ALLOWED_MIME_TYPES)

    assert exc_info.value.code is ErrorCode.INVALID_IMAGE


def test_mime_and_image_format_must_match() -> None:
    with pytest.raises(ImageValidationError) as exc_info:
        validate_image_content(make_image("PNG"), "image/jpeg", ALLOWED_MIME_TYPES)

    assert exc_info.value.code is ErrorCode.INVALID_IMAGE


def test_upload_larger_than_limit_is_rejected() -> None:
    upload = UploadFile(filename="large.jpg", file=BytesIO(b"a" * 11))

    with pytest.raises(ImageValidationError) as exc_info:
        asyncio.run(read_upload_with_limit(upload, max_size_bytes=10))

    assert exc_info.value.code is ErrorCode.IMAGE_TOO_LARGE


def test_empty_upload_is_rejected() -> None:
    upload = UploadFile(filename="empty.jpg", file=BytesIO())

    with pytest.raises(ImageValidationError) as exc_info:
        asyncio.run(read_upload_with_limit(upload, max_size_bytes=10))

    assert exc_info.value.code is ErrorCode.INVALID_IMAGE
