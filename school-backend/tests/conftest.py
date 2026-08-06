"""
Pytest Configuration — Fixtures and test setup

NOTE: This file was previously written with escaped-quote sequences (\\")
which made it a SyntaxError. It is rewritten cleanly here.
Requires pytest + pytest-asyncio (see requirements.txt) because
pytest.ini enables `asyncio_mode = auto`.
"""

from typing import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client (pytest-asyncio auto mode)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "role": "staff",
    }


@pytest.fixture
def sample_student_data():
    """Sample student data for testing."""
    return {
        "first_name": "Ahmed",
        "last_name": "Ali",
        "cnic_bform": "35201-1234567-1",
        "dob": "2010-01-15",
        "admission_date": "2023-04-01",
        "current_class": "5",
        "status": "active",
    }


@pytest.fixture
def sample_parent_data():
    """Sample parent data for testing."""
    return {
        "guardian_name": "Muhammad Ali",
        "cnic": "35201-1234567-1",
        "contact_no": "03001234567",
        "whatsapp_no": "03001234567",
        "address": "House #5, Street 3, Lahore",
    }


@pytest.fixture
def sample_teacher_data():
    """Sample teacher data for testing."""
    return {
        "first_name": "Sara",
        "last_name": "Khan",
        "email": "sara@school.com",
        "phone": "03001234567",
        "subject": "Mathematics",
        "qualification": "MSc Mathematics",
        "hire_date": "2023-04-01",
        "salary": 50000,
        "address": "House #10, Street 5, Lahore",
        "status": "active",
    }


@pytest.fixture
def sample_fee_type_data():
    """Sample fee type data for testing."""
    return {
        "fee_name": "Tuition Fee",
        "default_amount": 3500,
        "description": "Monthly tuition fee",
        "is_active": True,
    }
