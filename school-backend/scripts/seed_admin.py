"""
Seed Script — Create the first admin user for the School Management System.

Usage:
    cd school-backend
    python -m scripts.seed_admin

Environment Variables Required:
    DATABASE_URL — PostgreSQL connection string
    SYNC_DATABASE_URL — Synchronous PostgreSQL connection string
    SECRET_KEY — JWT secret key
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the parent directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash


async def create_admin_user():
    """Create the first admin user if it doesn't exist."""
    # Default admin credentials (change in production!)
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@school.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123!")
    admin_full_name = os.getenv("ADMIN_FULL_NAME", "System Administrator")

    async with AsyncSessionLocal() as db:
        # Check if admin user already exists
        result = await db.execute(
            select(User).where(User.username == admin_username)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"✅ Admin user '{admin_username}' already exists.")
            return

        # Create new admin user
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name=admin_full_name,
            role=UserRole.ADMIN.value,
            is_active=True,
            is_superuser=True,
        )

        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)

        print(f"✅ Admin user created successfully!")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Role: {UserRole.ADMIN.value}")
        print(f"\n⚠️  Change the password after first login!")


if __name__ == "__main__":
    asyncio.run(create_admin_user())
