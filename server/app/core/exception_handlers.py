from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.schemas.analyze import AnalyzeErrorResponse, ErrorCode, ErrorDetail
from app.services.analysis import ModelUnavailableError
from app.services.image_validation import ImageValidationError

logger = get_logger(__name__)

ERROR_STATUS_CODES = {
    ErrorCode.INVALID_IMAGE: 400,
    ErrorCode.INVALID_MODEL_TYPE: 400,
    ErrorCode.IMAGE_TOO_LARGE: 413,
    ErrorCode.UNSUPPORTED_IMAGE_TYPE: 415,
}


def _error_response(code: ErrorCode, message: str, status_code: int) -> JSONResponse:
    body = AnalyzeErrorResponse(error=ErrorDetail(code=code, message=message))
    return JSONResponse(status_code=status_code, content=body.model_dump(mode="json"))


async def handle_image_validation_error(
    request: Request,
    exc: ImageValidationError,
) -> JSONResponse:
    status_code = ERROR_STATUS_CODES[exc.code]
    logger.warning(
        "Analiz isteği reddedildi | path=%s code=%s status=%d",
        request.url.path,
        exc.code,
        status_code,
    )
    return _error_response(exc.code, exc.message, status_code)


async def handle_request_validation_error(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    logger.warning(
        "İstek doğrulaması başarısız | path=%s code=%s error_count=%d",
        request.url.path,
        ErrorCode.VALIDATION_ERROR,
        len(exc.errors()),
    )
    return _error_response(
        ErrorCode.VALIDATION_ERROR,
        "İstek alanları eksik veya geçersiz.",
        422,
    )


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Beklenmeyen sunucu hatası | path=%s", request.url.path, exc_info=exc)
    return _error_response(
        ErrorCode.INTERNAL_ERROR,
        "Beklenmeyen bir sunucu hatası oluştu.",
        500,
    )


async def handle_model_unavailable_error(
    request: Request,
    exc: ModelUnavailableError,
) -> JSONResponse:
    logger.error(
        "Model kullanılamıyor | path=%s code=%s",
        request.url.path,
        ErrorCode.MODEL_UNAVAILABLE,
    )
    return _error_response(
        ErrorCode.MODEL_UNAVAILABLE,
        "Detection modeli kullanıma hazır değil.",
        503,
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ImageValidationError, handle_image_validation_error)
    app.add_exception_handler(RequestValidationError, handle_request_validation_error)
    app.add_exception_handler(ModelUnavailableError, handle_model_unavailable_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
