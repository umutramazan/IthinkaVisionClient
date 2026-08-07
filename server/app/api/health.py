from fastapi import APIRouter, Request, Response, status

from app.core.logging import get_logger
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])
logger = get_logger(__name__)


@router.get("/live", response_model=HealthResponse, summary="Liveness kontrolü")
async def live() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/ready", response_model=HealthResponse, summary="Readiness kontrolü")
async def ready(request: Request, response: Response) -> HealthResponse:
    if not request.app.state.model_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        request.state.readiness = "unavailable"
        request.state.error_code = "MODEL_UNAVAILABLE"
        logger.warning(
            "Readiness kontrolü başarısız",
            extra={
                "event": "readiness_checked",
                "endpoint": request.url.path,
                "status": status.HTTP_503_SERVICE_UNAVAILABLE,
                "error_code": "MODEL_UNAVAILABLE",
                "readiness": "unavailable",
            },
        )
        return HealthResponse(status="unavailable")
    request.state.readiness = "ready"
    logger.debug(
        "Readiness kontrolü başarılı",
        extra={
            "event": "readiness_checked",
            "endpoint": request.url.path,
            "status": status.HTTP_200_OK,
            "readiness": "ready",
        },
    )
    return HealthResponse(status="ok")
