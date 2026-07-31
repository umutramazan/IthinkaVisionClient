from fastapi.testclient import TestClient

from app.config.settings import Settings
from app.inference.base_model import BaseModel
from app.main import create_app
from app.schemas.analyze import Detection


class FakeDetectionModel(BaseModel):
    def predict(self, image_bytes: bytes) -> list[Detection]:
        return []


def create_fake_model(settings: Settings) -> BaseModel:
    return FakeDetectionModel()


def test_liveness_returns_ok(client: TestClient) -> None:
    response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_returns_ok(client: TestClient) -> None:
    response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_openapi_schema_is_served_in_development(client: TestClient) -> None:
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "iThinka Vision API"


def test_docs_are_disabled_in_production() -> None:
    production_app = create_app(Settings(env="production"), model_factory=create_fake_model)

    with TestClient(production_app) as production_client:
        assert production_client.get("/docs").status_code == 404
        assert production_client.get("/health/live").status_code == 200
