from app.schemas.analyze import AnalyzeSuccessResponse, Detection


def analyze_dummy() -> AnalyzeSuccessResponse:
    return AnalyzeSuccessResponse(
        detections=[
            Detection(class_name="Person", confidence=0.96),
            Detection(class_name="Helmet", confidence=0.91),
        ]
    )
