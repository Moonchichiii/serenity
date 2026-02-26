import pytest
from drf_spectacular.generators import SchemaGenerator
from drf_spectacular.validation import validate_schema


@pytest.mark.django_db
class TestOpenAPISchema:
    def _generate_schema(self):
        generator = SchemaGenerator(patterns=None)
        return generator.get_schema(request=None, public=True)

    def test_schema_generates_without_errors(self):
        schema = self._generate_schema()
        assert schema is not None
        assert "paths" in schema
        assert "components" in schema

    def test_schema_is_valid_openapi(self):
        schema = self._generate_schema()
        errors = validate_schema(schema)
        assert not errors, f"Schema validation errors: {errors}"

    def test_schema_contains_critical_endpoints(self):
        schema = self._generate_schema()
        paths = schema.get("paths", {})

        critical = [
            "/api/homepage/hydrated/",
            "/api/vouchers/",
            "/api/availability/",
            "/api/testimonials/",
            "/api/contact/",
        ]
        for path in critical:
            assert path in paths, f"Missing critical endpoint: {path}"

    def test_hydrated_response_shape(self):
        """The homepage/hydrated/ 200 response must contain the fields
        the React SPA destructures on first load."""
        schema = self._generate_schema()
        hydrated_path = schema["paths"].get("/api/homepage/hydrated/", {})
        get_op = hydrated_path.get("get", {})
        resp_200 = get_op.get("responses", {}).get("200", {})

        # Resolve the $ref to the component schema
        ref = (
            resp_200.get("content", {})
            .get("application/json", {})
            .get("schema", {})
            .get("$ref", "")
        )
        assert ref, "Hydrated endpoint must have a schema ref"

        component_name = ref.split("/")[-1]
        component = schema["components"]["schemas"][component_name]
        properties = component.get("properties", {})

        required_keys = {"page", "services", "globals", "testimonials"}
        assert required_keys.issubset(
            properties.keys()
        ), f"Hydrated schema missing keys: {required_keys - properties.keys()}"
