from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.config.settings import Settings
from app.inference.base_model import BaseModel
from app.main import create_app
from app.schemas.analyze import Detection


class FakeDetectionModel(BaseModel):
    def predict(self, image_bytes: bytes) -> list[Detection]:
        return [
            Detection(class_name="Person", confidence=0.96),
            Detection(class_name="Helmet", confidence=0.91),
        ]


def create_fake_model(settings: Settings) -> BaseModel:
    return FakeDetectionModel()


@pytest.fixture
def settings() -> Settings:
    return Settings(env="development", log_level="WARNING")


@pytest.fixture
def app(settings: Settings) -> FastAPI:
    return create_app(settings, model_factory=create_fake_model)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
