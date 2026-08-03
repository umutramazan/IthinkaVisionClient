from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.core.request_context import REQUEST_ID_HEADER
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


def _error_response(
    request: Request,
    code: ErrorCode,
    message: str,
    status_code: int,
) -> JSONResponse:
    body = AnalyzeErrorResponse(error=ErrorDetail(code=code, message=message))
    request_id = getattr(request.state, "request_id", None)
    headers = {REQUEST_ID_HEADER: request_id} if request_id else None
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json"),
        headers=headers,
    )


async def handle_image_validation_error(
    request: Request,
    exc: ImageValidationError,
) -> JSONResponse:
    status_code = ERROR_STATUS_CODES[exc.code]
    request.state.error_code = exc.code
    logger.warning(
        "Analiz isteği reddedildi",
        extra={
            "event": "analysis_rejected",
            "request_id": getattr(request.state, "request_id", "-"),
            "endpoint": request.url.path,
            "status": status_code,
            "error_code": exc.code,
            "model_type": getattr(request.state, "model_type", None),
        },
    )
    return _error_response(request, exc.code, exc.message, status_code)


async def handle_request_validation_error(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    request.state.error_code = ErrorCode.VALIDATION_ERROR
    logger.warning(
        "İstek doğrulaması başarısız",
        extra={
            "event": "request_validation_failed",
            "request_id": getattr(request.state, "request_id", "-"),
            "endpoint": request.url.path,
            "status": 422,
            "error_code": ErrorCode.VALIDATION_ERROR,
        },
    )
    return _error_response(
        request,
        ErrorCode.VALIDATION_ERROR,
        "İstek alanları eksik veya geçersiz.",
        422,
    )


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    request.state.error_code = ErrorCode.INTERNAL_ERROR
    logger.exception(
        "Beklenmeyen sunucu hatası",
        exc_info=exc,
        extra={
            "event": "request_failed",
            "request_id": getattr(request.state, "request_id", "-"),
            "endpoint": request.url.path,
            "status": 500,
            "error_code": ErrorCode.INTERNAL_ERROR,
            "model_type": getattr(request.state, "model_type", None),
        },
    )
    return _error_response(
        request,
        ErrorCode.INTERNAL_ERROR,
        "Beklenmeyen bir sunucu hatası oluştu.",
        500,
    )


async def handle_model_unavailable_error(
    request: Request,
    exc: ModelUnavailableError,
) -> JSONResponse:
    request.state.error_code = ErrorCode.MODEL_UNAVAILABLE
    logger.error(
        "Model kullanılamıyor",
        extra={
            "event": "model_unavailable",
            "request_id": getattr(request.state, "request_id", "-"),
            "endpoint": request.url.path,
            "status": 503,
            "error_code": ErrorCode.MODEL_UNAVAILABLE,
            "model_type": getattr(request.state, "model_type", None),
        },
    )
    return _error_response(
        request,
        ErrorCode.MODEL_UNAVAILABLE,
        "Detection modeli kullanıma hazır değil.",
        503,
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ImageValidationError, handle_image_validation_error)
    app.add_exception_handler(RequestValidationError, handle_request_validation_error)
    app.add_exception_handler(ModelUnavailableError, handle_model_unavailable_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
