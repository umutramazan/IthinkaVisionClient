import logging
from contextvars import ContextVar
from time import perf_counter
from uuid import uuid4

from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

REQUEST_ID_HEADER = "X-Request-ID"
HEALTHCHECK_PATHS = frozenset({"/health/live", "/health/ready"})

_request_id_context: ContextVar[str | None] = ContextVar("request_id", default=None)
logger = logging.getLogger(__name__)

REQUEST_LOG_FIELDS = (
    "model_type",
    "detection_count",
    "error_code",
    "readiness",
)


def get_request_id() -> str | None:
    """Geçerli HTTP isteğinin teknik correlation kimliğini döndürür."""
    return _request_id_context.get()


class RequestContextMiddleware:
    """Her HTTP isteğine sunucu tarafından üretilen bir request ID bağlar."""

    def __init__(self, app: ASGIApp) -> None:
        self._app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self._app(scope, receive, send)
            return

        request_id = str(uuid4())
        request_state = scope.setdefault("state", {})
        request_state["request_id"] = request_id
        context_token = _request_id_context.set(request_id)
        endpoint = scope["path"]
        is_healthcheck = endpoint in HEALTHCHECK_PATHS
        started_at = perf_counter()
        response_status: int | None = None

        if not is_healthcheck:
            logger.info(
                "HTTP isteği başladı",
                extra={"event": "request_started", "endpoint": endpoint},
            )

        async def send_with_request_id(message: Message) -> None:
            nonlocal response_status
            if message["type"] == "http.response.start":
                response_status = message["status"]
                headers = MutableHeaders(scope=message)
                headers[REQUEST_ID_HEADER] = request_id
            await send(message)

        try:
            await self._app(scope, receive, send_with_request_id)
        except BaseException:
            duration_ms = round((perf_counter() - started_at) * 1000, 2)
            logger.exception(
                "HTTP isteği tamamlanamadı",
                extra={
                    "event": "request_failed",
                    "endpoint": endpoint,
                    "status": 500,
                    "duration_ms": duration_ms,
                    "error_code": request_state.get("error_code", "INTERNAL_ERROR"),
                },
            )
            raise
        else:
            duration_ms = round((perf_counter() - started_at) * 1000, 2)
            status = response_status or 500
            extra = {
                "event": "request_completed",
                "endpoint": endpoint,
                "status": status,
                "duration_ms": duration_ms,
            }
            extra.update(
                {
                    field: request_state[field]
                    for field in REQUEST_LOG_FIELDS
                    if request_state.get(field) is not None
                }
            )
            level = (
                logging.ERROR
                if status >= 500
                else logging.WARNING
                if status >= 400
                else logging.INFO
            )
            if not is_healthcheck or status >= 400:
                logger.log(level, "HTTP isteği tamamlandı", extra=extra)
        finally:
            _request_id_context.reset(context_token)
