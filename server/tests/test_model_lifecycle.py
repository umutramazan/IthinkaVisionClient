import asyncio
import threading
import time
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.config.settings import Settings
from app.inference.base_model import BaseModel
from app.main import create_app
from app.schemas.analyze import Detection
from app.services.analysis import AnalysisService


def make_image() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format="JPEG")
    return buffer.getvalue()


class CountingModel(BaseModel):
    def __init__(self) -> None:
        self.predict_calls = 0

    def predict(self, image_bytes: bytes) -> list[Detection]:
        self.predict_calls += 1
        return [Detection(class_name="pothole", confidence=0.8)]


def test_model_is_loaded_once_and_reused_for_requests() -> None:
    model = CountingModel()
    load_calls = 0

    def factory(settings: Settings) -> BaseModel:
        nonlocal load_calls
        load_calls += 1
        return model

    app = create_app(Settings(log_level="CRITICAL"), model_factory=factory)
    with TestClient(app) as client:
        for _ in range(2):
            response = client.post(
                "/api/v1/analyze",
                data={"modelType": "detection"},
                files={"image": ("sample.jpg", make_image(), "image/jpeg")},
            )
            assert response.status_code == 200

    assert load_calls == 1
    assert model.predict_calls == 2


def test_failed_model_load_marks_readiness_and_analysis_unavailable() -> None:
    def failing_factory(settings: Settings) -> BaseModel:
        raise RuntimeError("model could not load")

    app = create_app(
        Settings(log_level="CRITICAL"),
        model_factory=failing_factory,
    )
    with TestClient(app, raise_server_exceptions=False) as client:
        ready_response = client.get("/health/ready")
        analyze_response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("sample.jpg", make_image(), "image/jpeg")},
        )

    assert ready_response.status_code == 503
    assert ready_response.json() == {"status": "unavailable"}
    assert analyze_response.status_code == 503
    assert analyze_response.json()["error"]["code"] == "MODEL_UNAVAILABLE"


class ConcurrentModel(BaseModel):
    def __init__(self) -> None:
        self.active = 0
        self.max_active = 0
        self.lock = threading.Lock()

    def predict(self, image_bytes: bytes) -> list[Detection]:
        with self.lock:
            self.active += 1
            self.max_active = max(self.max_active, self.active)
        time.sleep(0.03)
        with self.lock:
            self.active -= 1
        return []


def test_analysis_service_limits_concurrent_inference() -> None:
    model = ConcurrentModel()
    service = AnalysisService(model, max_concurrency=2)

    async def run_requests() -> None:
        await asyncio.gather(*(service.analyze(b"image") for _ in range(6)))

    try:
        asyncio.run(run_requests())
    finally:
        service.close()

    assert model.max_active == 2
