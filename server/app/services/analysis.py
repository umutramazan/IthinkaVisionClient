import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.inference.base_model import BaseModel
from app.schemas.analyze import AnalyzeSuccessResponse


class AnalysisService:
    """Senkron model çağrılarını event loop dışında ve sınırlı eşzamanlılıkla çalıştırır."""

    def __init__(self, model: BaseModel, max_concurrency: int) -> None:
        self._model = model
        self._semaphore = asyncio.Semaphore(max_concurrency)
        self._executor = ThreadPoolExecutor(
            max_workers=max_concurrency,
            thread_name_prefix="detection-inference",
        )

    async def analyze(self, image_bytes: bytes) -> AnalyzeSuccessResponse:
        async with self._semaphore:
            loop = asyncio.get_running_loop()
            detections = await loop.run_in_executor(
                self._executor,
                self._model.predict,
                image_bytes,
            )
        return AnalyzeSuccessResponse(detections=detections)

    def close(self) -> None:
        self._executor.shutdown(wait=True, cancel_futures=True)


class ModelUnavailableError(RuntimeError):
    """Model yüklenemediğinde analiz isteğinin kontrollü biçimde reddedilmesini sağlar."""
