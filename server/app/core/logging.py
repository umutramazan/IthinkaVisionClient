import json
import logging
import sys
from datetime import UTC, datetime
from logging.config import dictConfig
from typing import Any, Literal

from app.core.request_context import get_request_id

LogEnvironment = Literal["development", "production"]

STRUCTURED_FIELDS = (
    "endpoint",
    "model_type",
    "status",
    "duration_ms",
    "detection_count",
    "error_code",
    "environment",
    "version",
    "model_path",
    "concurrency",
    "readiness",
)


class RequestContextFilter(logging.Filter):
    """Aktif request ID'yi tüm log kayıtlarına ekler."""

    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = get_request_id() or "-"
        return True


class DevelopmentFormatter(logging.Formatter):
    """Yerel geliştirme için okunabilir, tek satırlık log formatı."""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%dT%H:%M:%S%z",
        )

    def format(self, record: logging.LogRecord) -> str:
        message = super().format(record)
        context = [f"request_id={getattr(record, 'request_id', '-')}"]
        context.extend(
            f"{field}={getattr(record, field)}"
            for field in STRUCTURED_FIELDS
            if getattr(record, field, None) is not None
        )
        return f"{message} | {' '.join(context)}"


class ProductionJsonFormatter(logging.Formatter):
    """Production stdout için tek satırlık JSON log formatı."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(
                timespec="milliseconds"
            ),
            "level": record.levelname,
            "logger": record.name,
            "event": getattr(record, "event", "log"),
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        payload.update(
            {
                field: getattr(record, field)
                for field in STRUCTURED_FIELDS
                if getattr(record, field, None) is not None
            }
        )
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False, separators=(",", ":"), default=str)


def configure_logging(
    level: str = "INFO",
    environment: LogEnvironment = "development",
) -> None:
    reconfigure = getattr(sys.stdout, "reconfigure", None)
    if reconfigure is not None:
        reconfigure(encoding="utf-8", errors="backslashreplace")

    formatter_name = "production_json" if environment == "production" else "development"

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "development": {"()": DevelopmentFormatter},
                "production_json": {"()": ProductionJsonFormatter},
            },
            "filters": {
                "request_context": {"()": RequestContextFilter},
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "filters": ["request_context"],
                    "formatter": formatter_name,
                    "stream": "ext://sys.stdout",
                }
            },
            "root": {"handlers": ["console"], "level": level},
            "loggers": {
                "uvicorn": {"handlers": ["console"], "level": level, "propagate": False},
                "uvicorn.error": {"handlers": ["console"], "level": level, "propagate": False},
                "uvicorn.access": {"handlers": ["console"], "level": level, "propagate": False},
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
