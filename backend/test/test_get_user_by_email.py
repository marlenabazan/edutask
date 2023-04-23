import pytest
import unittest.mock as mock

from src.controllers.usercontroller import UserController

@pytest.fixture
def sut():
    mocked_dao = mock.MagicMock()
    mocked_controller = UserController(dao=mocked_dao)

    return mocked_controller

@pytest.mark.unit
def test_returns_none_when_no_matches(sut):
    sut.dao.find.return_value = []

    assert sut.get_user_by_email('test@test.com') == None

@pytest.mark.unit
def test_returns_user_object_when_one_match(sut):
    user = {'name': 'test user', 'email': 'test@test.com'}
    sut.dao.find.return_value = [user]

    assert sut.get_user_by_email('test@test.com') == user

@pytest.mark.unit
def test_get_user_by_email_returns_first_user_object_when_more_than_one_match(sut):
    users = [{'name': 'test user1', 'email': 'test@test.com'}, {'name': 'test user2', 'email': 'test@test.com'}]
    sut.dao.find.return_value = users

    assert sut.get_user_by_email('test@test.com') == users[0]

@pytest.mark.unit
def test_raises_value_error_when_invalid_email(sut):
    with pytest.raises(ValueError):
        sut.get_user_by_email('invalid_email')

@pytest.mark.unit
def test_raises_exception_when_database_operation_fails(sut):
    sut.dao.find.return_value = Exception
    with pytest.raises(Exception):
        sut.get_user_by_email('test@test.com')
