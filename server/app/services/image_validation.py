from io import BytesIO
from warnings import catch_warnings, simplefilter

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.schemas.analyze import ErrorCode

SUPPORTED_IMAGE_FORMATS = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
}


class ImageValidationError(Exception):
    def __init__(self, code: ErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def validate_model_type(model_type: str) -> None:
    if model_type != "detection":
        raise ImageValidationError(
            ErrorCode.INVALID_MODEL_TYPE,
            "modelType yalnızca 'detection' olabilir.",
        )


async def read_upload_with_limit(upload: UploadFile, max_size_bytes: int) -> bytes:
    content = await upload.read(max_size_bytes + 1)

    if len(content) > max_size_bytes:
        raise ImageValidationError(
            ErrorCode.IMAGE_TOO_LARGE,
            "Görsel izin verilen maksimum boyutu aşıyor.",
        )

    if not content:
        raise ImageValidationError(
            ErrorCode.INVALID_IMAGE,
            "Görsel dosyası boş olamaz.",
        )

    return content


def validate_image_content(
    content: bytes,
    content_type: str | None,
    allowed_mime_types: set[str],
) -> None:
    normalized_content_type = (content_type or "").lower()

    if normalized_content_type not in allowed_mime_types:
        raise ImageValidationError(
            ErrorCode.UNSUPPORTED_IMAGE_TYPE,
            "Yalnızca JPEG ve PNG görseller desteklenir.",
        )

    expected_format = SUPPORTED_IMAGE_FORMATS.get(normalized_content_type)
    if expected_format is None:
        raise ImageValidationError(
            ErrorCode.UNSUPPORTED_IMAGE_TYPE,
            "Yapılandırılmış görsel türü sunucu tarafından desteklenmiyor.",
        )

    try:
        with catch_warnings():
            simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(content)) as image:
                actual_format = image.format
                image.verify()
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise ImageValidationError(
            ErrorCode.INVALID_IMAGE,
            "Görsel güvenli piksel sınırını aşıyor.",
        ) from None
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise ImageValidationError(
            ErrorCode.INVALID_IMAGE,
            "Geçersiz veya decode edilemeyen görsel.",
        ) from None

    if actual_format != expected_format:
        raise ImageValidationError(
            ErrorCode.INVALID_IMAGE,
            "Görsel içeriği bildirilen MIME türüyle eşleşmiyor.",
        )
