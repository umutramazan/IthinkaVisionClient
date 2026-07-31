from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import numpy as np
from PIL import Image

from app.inference.detection_model import DetectionModel


def make_image(width: int = 20, height: int = 10) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (width, height), color=(255, 0, 0)).save(buffer, format="JPEG")
    return buffer.getvalue()


class FakeSession:
    def __init__(self, output: np.ndarray[Any, np.dtype[np.float32]]) -> None:
        self.output = output
        self.received_input: np.ndarray[Any, np.dtype[np.float32]] | None = None

    def get_inputs(self) -> list[SimpleNamespace]:
        return [SimpleNamespace(name="images", shape=[1, 3, 640, 640])]

    def get_outputs(self) -> list[SimpleNamespace]:
        return [SimpleNamespace(name="output0", shape=[1, 300, 6])]

    def get_modelmeta(self) -> SimpleNamespace:
        return SimpleNamespace(custom_metadata_map={"names": "{0: 'pothole', 1: 'debris'}"})

    def run(
        self,
        output_names: list[str],
        input_feed: dict[str, np.ndarray[Any, np.dtype[np.float32]]],
    ) -> list[np.ndarray[Any, np.dtype[np.float32]]]:
        assert output_names == ["output0"]
        self.received_input = input_feed["images"]
        return [self.output]


def test_predict_preprocesses_image_and_maps_thresholded_detections() -> None:
    output = np.zeros((1, 300, 6), dtype=np.float32)
    output[0, 0] = [10, 20, 30, 40, 0.9, 0]
    output[0, 1] = [50, 60, 70, 80, 0.2, 1]
    output[0, 2] = [90, 100, 110, 120, 0.75, 1]
    session = FakeSession(output)
    model = DetectionModel(Path("unused.onnx"), confidence_threshold=0.25, session=session)

    detections = model.predict(make_image())

    assert [(item.class_name, item.confidence) for item in detections] == [
        ("pothole", 0.8999999761581421),
        ("debris", 0.75),
    ]
    assert session.received_input is not None
    assert session.received_input.shape == (1, 3, 640, 640)
    assert session.received_input.dtype == np.float32
    assert session.received_input.flags.c_contiguous
    assert float(session.received_input.min()) >= 0.0
    assert float(session.received_input.max()) <= 1.0


def test_predict_returns_empty_list_when_all_scores_are_below_threshold() -> None:
    output = np.zeros((1, 300, 6), dtype=np.float32)
    session = FakeSession(output)
    model = DetectionModel(Path("unused.onnx"), confidence_threshold=0.25, session=session)

    assert model.predict(make_image()) == []
