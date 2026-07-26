from fastapi.testclient import TestClient


def resolve_schema(openapi: dict[str, object], reference: str) -> dict[str, object]:
    schema_name = reference.rsplit("/", maxsplit=1)[-1]
    components = openapi["components"]
    assert isinstance(components, dict)
    schemas = components["schemas"]
    assert isinstance(schemas, dict)
    schema = schemas[schema_name]
    assert isinstance(schema, dict)
    return schema


def test_openapi_documents_multipart_request_fields(client: TestClient) -> None:
    openapi = client.get("/openapi.json").json()
    operation = openapi["paths"]["/api/v1/analyze"]["post"]
    request_schema = operation["requestBody"]["content"]["multipart/form-data"]["schema"]
    body_schema = resolve_schema(openapi, request_schema["$ref"])

    assert set(body_schema["required"]) == {"image", "modelType"}
    assert body_schema["properties"]["image"]["type"] == "string"
    assert body_schema["properties"]["image"]["contentMediaType"] == "application/octet-stream"
    assert body_schema["properties"]["modelType"]["type"] == "string"


def test_openapi_documents_success_and_error_responses(client: TestClient) -> None:
    openapi = client.get("/openapi.json").json()
    responses = openapi["paths"]["/api/v1/analyze"]["post"]["responses"]

    success_reference = responses["200"]["content"]["application/json"]["schema"]["$ref"]
    assert success_reference.endswith("/AnalyzeSuccessResponse")

    for status_code in ("400", "413", "415", "422", "500"):
        error_reference = responses[status_code]["content"]["application/json"]["schema"]["$ref"]
        assert error_reference.endswith("/AnalyzeErrorResponse")


def test_openapi_detection_schema_uses_public_field_names(client: TestClient) -> None:
    openapi = client.get("/openapi.json").json()
    detection_schema = openapi["components"]["schemas"]["Detection"]

    assert set(detection_schema["required"]) == {"class", "confidence"}
    assert "class_name" not in detection_schema["properties"]
    assert detection_schema["properties"]["confidence"]["minimum"] == 0.0
    assert detection_schema["properties"]["confidence"]["maximum"] == 1.0
