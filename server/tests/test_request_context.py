import logging
from unittest.mock import patch
from uuid import UUID

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.core.request_context import REQUEST_ID_HEADER


def assert_uuid(value: str) -> None:
    assert str(UUID(value)) == value


def test_request_id_is_generated_and_returned_in_response(client: TestClient) -> None:
    response = client.get("/health/live")

    assert response.status_code == 200
    assert_uuid(response.headers[REQUEST_ID_HEADER])


def test_each_request_receives_a_unique_request_id(client: TestClient) -> None:
    first_response = client.get("/health/live")
    second_response = client.get("/health/live")

    first_request_id = first_response.headers[REQUEST_ID_HEADER]
    second_request_id = second_response.headers[REQUEST_ID_HEADER]

    assert_uuid(first_request_id)
    assert_uuid(second_request_id)
    assert first_request_id != second_request_id


def test_request_id_is_available_from_request_state(app: FastAPI) -> None:
    @app.get("/_test/request-id")
    async def read_request_id(request: Request) -> dict[str, str]:
        return {"request_id": request.state.request_id}

    with TestClient(app) as client:
        response = client.get("/_test/request-id")

    assert response.status_code == 200
    assert response.json()["request_id"] == response.headers[REQUEST_ID_HEADER]


def test_server_replaces_incoming_request_id(client: TestClient) -> None:
    response = client.get(
        "/health/live",
        headers={REQUEST_ID_HEADER: "client-controlled-value"},
    )

    request_id = response.headers[REQUEST_ID_HEADER]
    assert request_id != "client-controlled-value"
    assert_uuid(request_id)


def test_error_response_contains_request_id(client: TestClient) -> None:
    response = client.post("/api/v1/analyze", data={"modelType": "detection"})

    assert response.status_code == 422
    assert_uuid(response.headers[REQUEST_ID_HEADER])


def test_cors_exposes_request_id_header(client: TestClient) -> None:
    response = client.get(
        "/health/live",
        headers={"Origin": "http://localhost:8081"},
    )

    exposed_headers = response.headers["access-control-expose-headers"].lower()
    assert REQUEST_ID_HEADER.lower() in exposed_headers


def test_request_lifecycle_logs_status_duration_and_analysis_fields(client: TestClient) -> None:
    with (
        patch("app.core.request_context.logger.info") as log_started,
        patch("app.core.request_context.logger.log") as log_completed,
    ):
        response = client.post(
            "/api/v1/analyze",
            data={"modelType": "detection"},
            files={"image": ("sample.jpg", b"not-an-image", "image/jpeg")},
        )

    assert response.status_code == 400
    assert log_started.call_args.kwargs["extra"] == {
        "event": "request_started",
        "endpoint": "/api/v1/analyze",
    }
    completion_extra = log_completed.call_args.kwargs["extra"]
    assert completion_extra["event"] == "request_completed"
    assert completion_extra["endpoint"] == "/api/v1/analyze"
    assert completion_extra["model_type"] == "detection"
    assert completion_extra["status"] == 400
    assert completion_extra["error_code"] == "INVALID_IMAGE"
    assert completion_extra["duration_ms"] >= 0


def test_successful_healthcheck_skips_request_lifecycle_logs(client: TestClient) -> None:
    with (
        patch("app.core.request_context.logger.info") as log_started,
        patch("app.core.request_context.logger.log") as log_completed,
    ):
        response = client.get("/health/ready")

    assert response.status_code == 200
    log_started.assert_not_called()
    log_completed.assert_not_called()


def test_failed_healthcheck_keeps_error_completion_log(client: TestClient) -> None:
    client.app.state.model_ready = False
    try:
        with (
            patch("app.core.request_context.logger.info") as log_started,
            patch("app.core.request_context.logger.log") as log_completed,
        ):
            response = client.get("/health/ready")
    finally:
        client.app.state.model_ready = True

    assert response.status_code == 503
    log_started.assert_not_called()
    log_completed.assert_called_once()
    level, _message = log_completed.call_args.args
    assert level == logging.ERROR
    assert log_completed.call_args.kwargs["extra"]["status"] == 503
