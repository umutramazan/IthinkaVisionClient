import logging
from collections.abc import Iterator
from contextlib import contextmanager
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.config.settings import Settings
from app.core.logging import ProductionJsonFormatter, RequestContextFilter
from app.core.request_context import REQUEST_ID_HEADER
from app.inference.base_model import BaseModel
from app.main import create_app
from app.schemas.analyze import Detection


def make_image() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format="JPEG")
    return buffer.getvalue()


class RecordCollector(logging.Handler):
    def __init__(self) -> None:
        super().__init__()
        self.records: list[logging.LogRecord] = []
        self.addFilter(RequestContextFilter())

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(record)


@contextmanager
def capture_logs() -> Iterator[RecordCollector]:
    collector = RecordCollector()
    root_logger = logging.getLogger()
    previous_level = root_logger.level
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(collector)
    try:
        yield collector
    finally:
        root_logger.removeHandler(collector)
        root_logger.setLevel(previous_level)


def event_records(collector: RecordCollector) -> list[logging.LogRecord]:
    return [record for record in collector.records if hasattr(record, "event")]


def assert_single_request_id(
    records: list[logging.LogRecord],
    expected_request_id: str,
) -> None:
    assert records
    assert {record.request_id for record in records} == {expected_request_id}


def test_successful_analysis_logs_are_correlated(client: TestClient) -> None:
    with capture_logs() as logs:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("sample.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 200
    request_id = response.headers[REQUEST_ID_HEADER]
    records = event_records(logs)
    events = {record.event for record in records}

    assert {"request_started", "analysis_completed", "request_completed"} <= events
    assert_single_request_id(records, request_id)

    completed = next(record for record in records if record.event == "request_completed")
    assert completed.status == 200
    assert completed.model_type == "detection"
    assert completed.detection_count == 2
    assert completed.duration_ms >= 0


def test_validation_error_logs_are_correlated(client: TestClient) -> None:
    with capture_logs() as logs:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "classification"},
            files={"image": ("sample.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 400
    request_id = response.headers[REQUEST_ID_HEADER]
    records = event_records(logs)
    events = {record.event for record in records}

    assert {"request_started", "analysis_rejected", "request_completed"} <= events
    assert_single_request_id(records, request_id)

    completed = next(record for record in records if record.event == "request_completed")
    assert completed.error_code == "INVALID_MODEL_TYPE"
    assert completed.status == 400


class FailingModel(BaseModel):
    def predict(self, image_bytes: bytes) -> list[Detection]:
        raise RuntimeError("controlled inference failure")


def create_failing_model(settings: Settings) -> BaseModel:
    return FailingModel()


def test_inference_error_logs_and_response_are_correlated() -> None:
    app = create_app(Settings(log_level="INFO"), model_factory=create_failing_model)

    with capture_logs() as logs, TestClient(app, raise_server_exceptions=False) as client:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("sample.jpg", make_image(), "image/jpeg")},
        )

    assert response.status_code == 500
    request_id = response.headers[REQUEST_ID_HEADER]
    request_records = [
        record
        for record in event_records(logs)
        if getattr(record, "request_id", None) == request_id
    ]
    events = {record.event for record in request_records}

    assert {"request_started", "request_failed"} <= events
    assert_single_request_id(request_records, request_id)
    assert any(
        getattr(record, "error_code", None) == "INTERNAL_ERROR" for record in request_records
    )


def test_logs_do_not_contain_image_or_sensitive_request_data(client: TestClient) -> None:
    image_marker = "PRIVATE_IMAGE_BYTE_MARKER"
    private_filename = "private-customer-image.jpg"
    authorization = "Bearer private-access-token"
    private_header = "private-header-value"
    image = make_image() + image_marker.encode()

    with capture_logs() as logs:
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": (private_filename, image, "image/jpeg")},
            headers={
                "Authorization": authorization,
                "X-Private-Header": private_header,
            },
        )

    assert response.status_code == 200
    formatter = ProductionJsonFormatter()
    serialized_logs = "\n".join(formatter.format(record) for record in event_records(logs))

    assert private_filename not in serialized_logs
    assert image_marker not in serialized_logs
    assert authorization not in serialized_logs
    assert private_header not in serialized_logs
    assert "authorization" not in serialized_logs.lower()
    assert "x-private-header" not in serialized_logs.lower()
