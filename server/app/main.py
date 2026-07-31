from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Protocol

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.api.v1.router import api_router
from app.config.settings import Settings, get_settings
from app.core.exception_handlers import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.inference.base_model import BaseModel
from app.inference.detection_model import DetectionModel
from app.services.analysis import AnalysisService

logger = get_logger(__name__)


class ModelFactory(Protocol):
    def __call__(self, settings: Settings) -> BaseModel: ...


def create_detection_model(settings: Settings) -> BaseModel:
    return DetectionModel(
        model_path=settings.model_path,
        confidence_threshold=settings.model_confidence_threshold,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings: Settings = app.state.settings
    logger.info("Uygulama başlatılıyor | env=%s version=%s", settings.env, settings.version)
    app.state.analysis_service = None
    app.state.model_ready = False

    try:
        model = app.state.model_factory(settings)
        app.state.analysis_service = AnalysisService(model, settings.inference_max_concurrency)
        app.state.model_ready = True
        logger.info(
            "Detection modeli yüklendi | path=%s concurrency=%d",
            settings.model_path,
            settings.inference_max_concurrency,
        )
    except Exception:
        logger.exception("Detection modeli yüklenemedi | path=%s", settings.model_path)

    try:
        yield
    finally:
        service: AnalysisService | None = app.state.analysis_service
        if service is not None:
            service.close()
        app.state.model_ready = False
        logger.info("Uygulama kapatılıyor")


def create_app(
    settings: Settings | None = None,
    model_factory: ModelFactory = create_detection_model,
) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.name,
        version=settings.version,
        docs_url=settings.docs_url,
        openapi_url=settings.openapi_url,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.model_factory = model_factory
    register_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
