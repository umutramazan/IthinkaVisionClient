import json
import logging
import sys

import pytest
from pydantic import ValidationError

from app.config.settings import Settings
from app.core.logging import (
    DevelopmentFormatter,
    ProductionJsonFormatter,
    RequestContextFilter,
    SuccessfulHealthcheckFilter,
    configure_logging,
)


def make_record(**extra: object) -> logging.LogRecord:
    record = logging.LogRecord(
        name="app.api.v1.analyze",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="Analiz tamamlandı",
        args=(),
        exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return record


def test_development_formatter_is_readable_and_includes_structured_fields() -> None:
    record = make_record(
        request_id="request-123",
        endpoint="/api/v1/analyze",
        status=200,
        duration_ms=51.25,
        detection_count=2,
    )

    output = DevelopmentFormatter().format(record)

    assert "Analiz tamamlandı" in output
    assert "request_id=request-123" in output
    assert "endpoint=/api/v1/analyze" in output
    assert "status=200" in output
    assert "duration_ms=51.25" in output
    assert "detection_count=2" in output


def test_production_formatter_outputs_valid_json_with_structured_fields() -> None:
    record = make_record(
        event="analysis_completed",
        request_id="request-123",
        endpoint="/api/v1/analyze",
        model_type="detection",
        status=200,
        duration_ms=51.25,
        detection_count=2,
    )

    payload = json.loads(ProductionJsonFormatter().format(record))

    assert payload == {
        "timestamp": payload["timestamp"],
        "level": "INFO",
        "logger": "app.api.v1.analyze",
        "event": "analysis_completed",
        "message": "Analiz tamamlandı",
        "request_id": "request-123",
        "endpoint": "/api/v1/analyze",
        "model_type": "detection",
        "status": 200,
        "duration_ms": 51.25,
        "detection_count": 2,
    }
    assert payload["timestamp"].endswith("+00:00")


def test_request_context_filter_uses_placeholder_outside_request() -> None:
    record = make_record()

    assert RequestContextFilter().filter(record) is True
    assert record.request_id == "-"


def make_access_record(path: str, status: int) -> logging.LogRecord:
    return logging.LogRecord(
        name="uvicorn.access",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg='%s - "%s %s HTTP/%s" %d',
        args=("127.0.0.1:1234", "GET", path, "1.1", status),
        exc_info=None,
    )


def test_successful_healthcheck_filter_suppresses_only_successful_health_access() -> None:
    log_filter = SuccessfulHealthcheckFilter()

    assert log_filter.filter(make_access_record("/health/live", 200)) is False
    assert log_filter.filter(make_access_record("/health/ready?probe=1", 200)) is False
    assert log_filter.filter(make_access_record("/health/ready", 503)) is True
    assert log_filter.filter(make_access_record("/api/v1/analyze", 200)) is True


@pytest.mark.parametrize(
    ("environment", "formatter_type"),
    [
        ("development", DevelopmentFormatter),
        ("production", ProductionJsonFormatter),
    ],
)
def test_configure_logging_selects_environment_formatter(
    environment: str,
    formatter_type: type[logging.Formatter],
) -> None:
    try:
        configure_logging("INFO", environment)  # type: ignore[arg-type]

        handler = logging.getLogger().handlers[0]
        assert handler.stream is sys.stdout
        assert isinstance(handler.formatter, formatter_type)
    finally:
        configure_logging("WARNING", "development")


def test_log_level_is_normalized_and_validated_from_settings() -> None:
    assert Settings(log_level="debug").log_level == "DEBUG"

    with pytest.raises(ValidationError):
        Settings(log_level="verbose")
