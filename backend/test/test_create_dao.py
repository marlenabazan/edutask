import pytest
import unittest.mock as mock

from unittest.mock import patch
from pymongo.errors import WriteError

from src.util.dao import DAO

validator = {
    "$jsonSchema": {
         "bsonType": "object",
         "required": [ "first_name", "last_name", "email"],
         "properties": {
            "first_name": {
               "bsonType": "string",
               "description": "'first_name' must be a string and is required"
            },
            "last_name": {
               "bsonType": "string",
               "description": "'last_name' must be a string and is required"
            },
            "email": {
               "bsonType": "string",
               "description": "'email' must be a string and is required",
               "uniqueItems": True
            }
        }
    }
}

@pytest.fixture
def sut():
    with patch("src.util.dao.getValidator", autospec=True) as mocked_validators:
        mocked_validators.return_value = validator
        sut = DAO("test")

        yield sut
        sut.collection.drop()

@pytest.mark.integration
@pytest.mark.parametrize("valid_data", [
    {"first_name": "Test", "last_name": "Testsson", "email": "test@test.com"},
    ])
def test_valid_data(sut, valid_data):
    result = sut.create(valid_data)
    assert isinstance(result, dict)
    assert result["first_name"] == "Test"
    assert "_id" in result

@pytest.mark.integration
@pytest.mark.parametrize("invalid_data", [
    {"first_name": "Test", "last_name": "Testsson", "email": 123},
    {"last_name": "Testsson", "email": "test@test.com"}
    ])
def test_invalid_data(sut, invalid_data):
    with pytest.raises(WriteError):
        sut.create(invalid_data)

@pytest.mark.integration
@pytest.mark.parametrize("not_unique_data", [
    {"first_name": "Test", "last_name": "Testsson", "email": "duplicate@test.com"}
    ])
def test_not_unique_email(sut, not_unique_data):
    sut.create(not_unique_data)
    existing_user = sut.find({"email": not_unique_data["email"]})
    
    if existing_user is not None:
        with pytest.raises(WriteError):
            sut.create(not_unique_data)
