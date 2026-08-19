import pytest
import fakeredis
from src.backend.core.store import DepartmentContextStore

@pytest.fixture
def store():
    fake_redis = fakeredis.FakeRedis(decode_responses=True)
    return DepartmentContextStore(redis_client=fake_redis)

def test_store_persistence(store):
    test_state = {"test": "value"}
    store.save_state("sess_1", test_state)
    assert store.get_state("sess_1") == test_state

def test_store_get_nonexistent_session(store):
    assert store.get_state("non_existent") is None
