from ast import literal_eval
from io import BytesIO
from pathlib import Path
from typing import Any, Protocol, cast

import numpy as np
import onnxruntime as ort
from numpy.typing import NDArray
from PIL import Image

from app.inference.base_model import BaseModel
from app.schemas.analyze import Detection

RGB_PADDING_COLOR = (114, 114, 114)
EXPECTED_OUTPUT_COLUMNS = 6


class _NodeArgument(Protocol):
    name: str
    shape: list[int | str | None]


class _ModelMetadata(Protocol):
    custom_metadata_map: dict[str, str]


class _InferenceSession(Protocol):
    def get_inputs(self) -> list[_NodeArgument]: ...

    def get_outputs(self) -> list[_NodeArgument]: ...

    def get_modelmeta(self) -> _ModelMetadata: ...

    def run(
        self,
        output_names: list[str],
        input_feed: dict[str, NDArray[np.float32]],
    ) -> list[Any]: ...


class DetectionModel(BaseModel):
    """YOLO26 end-to-end ONNX model adapter."""

    def __init__(
        self,
        model_path: Path,
        confidence_threshold: float,
        session: _InferenceSession | None = None,
    ) -> None:
        if session is None:
            if not model_path.is_file():
                raise FileNotFoundError(f"Model dosyası bulunamadı: {model_path}")
            session = cast(
                _InferenceSession,
                ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"]),
            )

        self._session = session
        self._confidence_threshold = confidence_threshold
        self._input_name, self._input_height, self._input_width = self._read_input()
        self._output_name = self._read_output()
        self._class_names = self._read_class_names()

    def predict(self, image_bytes: bytes) -> list[Detection]:
        input_tensor = self._preprocess(image_bytes)
        raw_outputs = self._session.run(
            [self._output_name],
            {self._input_name: input_tensor},
        )
        if len(raw_outputs) != 1:
            raise ValueError("Detection modeli tam olarak bir çıktı üretmelidir.")
        return self._map_detections(np.asarray(raw_outputs[0], dtype=np.float32))

    def _read_input(self) -> tuple[str, int, int]:
        inputs = self._session.get_inputs()
        if len(inputs) != 1:
            raise ValueError("Detection modeli tam olarak bir girdi kabul etmelidir.")

        model_input = inputs[0]
        if (
            len(model_input.shape) != 4
            or model_input.shape[0] != 1
            or model_input.shape[1] != 3
            or not isinstance(model_input.shape[2], int)
            or not isinstance(model_input.shape[3], int)
        ):
            raise ValueError("Beklenen ONNX girdi biçimi [1, 3, height, width].")

        return model_input.name, model_input.shape[2], model_input.shape[3]

    def _read_output(self) -> str:
        outputs = self._session.get_outputs()
        if len(outputs) != 1:
            raise ValueError("Detection modeli tam olarak bir çıktı üretmelidir.")

        model_output = outputs[0]
        if len(model_output.shape) != 3 or model_output.shape[-1] != EXPECTED_OUTPUT_COLUMNS:
            raise ValueError("Beklenen YOLO26 end-to-end çıktı biçimi [1, N, 6].")
        return model_output.name

    def _read_class_names(self) -> dict[int, str]:
        serialized_names = self._session.get_modelmeta().custom_metadata_map.get("names")
        if not serialized_names:
            raise ValueError("ONNX metadata içinde sınıf isimleri bulunamadı.")

        try:
            parsed_names = literal_eval(serialized_names)
        except (SyntaxError, ValueError) as exc:
            raise ValueError("ONNX sınıf metadata'sı okunamadı.") from exc

        if not isinstance(parsed_names, dict):
            raise ValueError("ONNX sınıf metadata'sı sözlük biçiminde olmalıdır.")

        class_names = {
            int(class_id): class_name
            for class_id, class_name in parsed_names.items()
            if isinstance(class_id, int) and isinstance(class_name, str) and class_name
        }
        if not class_names or len(class_names) != len(parsed_names):
            raise ValueError("ONNX sınıf metadata'sı geçersiz.")
        return class_names

    def _preprocess(self, image_bytes: bytes) -> NDArray[np.float32]:
        with Image.open(BytesIO(image_bytes)) as source:
            image = source.convert("RGB")

        scale = min(self._input_width / image.width, self._input_height / image.height)
        resized_width = max(1, round(image.width * scale))
        resized_height = max(1, round(image.height * scale))
        resized = image.resize((resized_width, resized_height), Image.Resampling.BILINEAR)

        canvas = Image.new("RGB", (self._input_width, self._input_height), RGB_PADDING_COLOR)
        offset = (
            (self._input_width - resized_width) // 2,
            (self._input_height - resized_height) // 2,
        )
        canvas.paste(resized, offset)

        pixels = np.asarray(canvas, dtype=np.float32) / np.float32(255.0)
        channels_first = np.transpose(pixels, (2, 0, 1))
        return np.ascontiguousarray(channels_first[np.newaxis, ...], dtype=np.float32)

    def _map_detections(self, output: NDArray[np.float32]) -> list[Detection]:
        if output.ndim != 3 or output.shape[0] != 1 or output.shape[2] != EXPECTED_OUTPUT_COLUMNS:
            raise ValueError("Model çalışma zamanında beklenmeyen detection çıktısı üretti.")

        detections: list[Detection] = []
        for row in output[0]:
            confidence = float(row[4])
            if not np.isfinite(confidence) or confidence < self._confidence_threshold:
                continue

            raw_class_id = float(row[5])
            if not np.isfinite(raw_class_id) or not raw_class_id.is_integer():
                raise ValueError("Model geçersiz bir sınıf kimliği üretti.")

            class_id = int(raw_class_id)
            class_name = self._class_names.get(class_id)
            if class_name is None:
                raise ValueError(f"Model bilinmeyen bir sınıf kimliği üretti: {class_id}")
            if confidence > 1.0:
                raise ValueError("Model 0-1 aralığı dışında güven değeri üretti.")

            detections.append(Detection(class_name=class_name, confidence=confidence))

        return detections
