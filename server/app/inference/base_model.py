from abc import ABC, abstractmethod

from app.schemas.analyze import Detection


class BaseModel(ABC):
    """API katmanını model runtime'ından ayıran senkron inference arayüzü."""

    @abstractmethod
    def predict(self, image_bytes: bytes) -> list[Detection]:
        """Bir görseli analiz edip API sözleşmesine uygun detection listesi döndürür."""
