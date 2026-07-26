from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live", response_model=HealthResponse, summary="Liveness kontrolü")
async def live() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/ready", response_model=HealthResponse, summary="Readiness kontrolü")
async def ready() -> HealthResponse:
    # FAZ 5'te model yüklenme durumu bu kontrole eklenecek.
    return HealthResponse(status="ok")
