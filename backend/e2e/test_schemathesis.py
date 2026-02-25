import pytest
import schemathesis

schema = schemathesis.from_pytest_fixture("live_schema")


@pytest.fixture(scope="session")
def live_schema(live_server):
    """Generate schema against the live test server."""
    return schemathesis.from_url(
        f"{live_server.url}/api/schema/",
        base_url=f"{live_server.url}",
    )


@schema.parametrize()
@pytest.mark.django_db(transaction=True)
def test_api_contracts(case):
    """Every endpoint must:
    - Not return 5xx
    - Match its declared response schema
    """
    response = case.call()
    case.validate_response(response)
    assert response.status_code < 500
