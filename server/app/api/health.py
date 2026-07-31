from fastapi import APIRouter, Request, Response, status

from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", response_model=HealthResponse, summary="Liveness kontrolü")
async def live() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/ready", response_model=HealthResponse, summary="Readiness kontrolü")
async def ready(request: Request, response: Response) -> HealthResponse:
    if not request.app.state.model_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return HealthResponse(status="unavailable")
    return HealthResponse(status="ok")
