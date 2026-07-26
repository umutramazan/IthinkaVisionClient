from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image


def make_image(image_format: str) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), color="white").save(buffer, format=image_format)
    return buffer.getvalue()


@pytest.mark.parametrize(
    ("image_format", "content_type", "filename"),
    [
        ("JPEG", "image/jpeg", "sample.jpg"),
        ("PNG", "image/png", "sample.png"),
    ],
)
def test_analyze_returns_dummy_detections_for_valid_image(
    client: TestClient,
    image_format: str,
    content_type: str,
    filename: str,
) -> None:
    response = client.post(
        "/api/v1/analyze",
        data={"modelType": "detection"},
        files={"image": (filename, make_image(image_format), content_type)},
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "detections": [
            {"class": "Person", "confidence": 0.96},
            {"class": "Helmet", "confidence": 0.91},
        ],
    }
