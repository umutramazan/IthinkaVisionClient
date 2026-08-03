from typing import Annotated

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config.settings import Settings
from app.core.logging import get_logger
from app.schemas.analyze import AnalyzeErrorResponse, AnalyzeSuccessResponse
from app.services.analysis import AnalysisService, ModelUnavailableError
from app.services.image_validation import (
    read_upload_with_limit,
    validate_image_content,
    validate_model_type,
)

router = APIRouter(tags=["analysis"])
logger = get_logger(__name__)

ERROR_RESPONSES = {
    400: {"model": AnalyzeErrorResponse, "description": "Geçersiz model veya görsel"},
    413: {"model": AnalyzeErrorResponse, "description": "Görsel boyut limiti aşıldı"},
    415: {"model": AnalyzeErrorResponse, "description": "Desteklenmeyen görsel türü"},
    422: {"model": AnalyzeErrorResponse, "description": "Eksik veya geçersiz form alanı"},
    503: {"model": AnalyzeErrorResponse, "description": "Detection modeli kullanıma hazır değil"},
    500: {"model": AnalyzeErrorResponse, "description": "Beklenmeyen sunucu hatası"},
}


@router.post(
    "/analyze",
    response_model=AnalyzeSuccessResponse,
    responses=ERROR_RESPONSES,
    summary="Görseli detection modeliyle analiz et",
)
async def analyze_image(
    request: Request,
    image: Annotated[UploadFile, File(description="Analiz edilecek JPEG veya PNG görsel")],
    model_type: Annotated[
        str,
        Form(alias="modelType", description="MVP için yalnızca detection"),
    ],
) -> AnalyzeSuccessResponse:
    settings: Settings = request.app.state.settings
    request.state.model_type = model_type

    try:
        validate_model_type(model_type)
        content = await read_upload_with_limit(image, settings.max_upload_size_bytes)
        validate_image_content(content, image.content_type, settings.allowed_mime_types)
        service: AnalysisService | None = request.app.state.analysis_service
        if service is None:
            raise ModelUnavailableError
        result = await service.analyze(content)
        request.state.detection_count = len(result.detections)
        logger.info(
            "Analiz tamamlandı",
            extra={
                "event": "analysis_completed",
                "endpoint": request.url.path,
                "model_type": model_type,
                "status": 200,
                "detection_count": len(result.detections),
            },
        )
        return result
    finally:
        await image.close()
