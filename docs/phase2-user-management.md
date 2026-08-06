# 📋 Phase 2: User Management System

> **Completed:** 2026-08-05 | **Branch:** `my-changes`
> **Note:** This phase was already implemented in the codebase before Phase 1

---

## 🎯 Overview

Phase 2 implements a complete User Management System with role-based access control (RBAC).

---

## ✅ What Was Already Implemented

### 1. User Model with Role Column

**File:** `school-backend/app/models.py`

```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    role: Mapped[str] = mapped_column(String(10), default=UserRole.STAFF.value, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

---

### 2. Backend Users Router

**File:** `school-backend/app/routers.py`

```python
users_router = APIRouter(prefix="/users", tags=["User Management"])

@users_router.get("/", response_model=list[schemas.UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),  # Admin only
):
    return await crud.get_users(db, skip=skip, limit=limit)

@users_router.patch("/{user_id}/role", response_model=schemas.UserOut)
async def change_user_role(
    user_id: int,
    data: schemas.UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),  # Admin only
):
    user = await crud.update_user_role(db, user_id, data.role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@users_router.patch("/{user_id}/password", status_code=204)
async def change_password(
    user_id: int,
    data: schemas.PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allow a user to change their own password (or admin to reset any)."""
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Cannot change another user's password")
    target = await crud.get_user_by_id(db, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    # Verify old password unless admin is resetting
    if current_user.id == user_id:
        if not verify_password(data.current_password, target.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
    await crud.update_user_password(db, user_id, data.new_password)
```

---

### 3. RBAC Middleware

**File:** `school-backend/app/auth.py`

```python
def require_role(allowed_roles: list[UserRole]):
    """Factory: returns a dependency that checks if the user has one of the allowed roles."""
    async def _role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of these roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return _role_checker

require_admin = require_role([UserRole.ADMIN])
require_staff_or_admin = require_role([UserRole.ADMIN, UserRole.STAFF])
```

---

### 4. Frontend Users Page

**File:** `school-frontend/src/pages/Users.jsx`

Features:
- ✅ User listing with search
- ✅ Create user modal
- ✅ Role toggle functionality
- ✅ Password reset modal
- ✅ Admin-only access guard
- ✅ Responsive design

---

### 5. Frontend API Integration

**File:** `school-frontend/src/api.js`

```javascript
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/auth/register', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  resetPassword: (id, newPassword) => api.patch(`/users/${id}/password`, { 
    current_password: '', 
    new_password: newPassword 
  }),
}
```

---

### 6. Frontend Route

**File:** `school-frontend/src/App.jsx`

```jsx
<Route path="/users" element={<UsersPage />} />
```

---

## 🧪 Testing

### Backend Tests
- ✅ User model has `role` column
- ✅ `/api/v1/users` endpoints work
- ✅ RBAC middleware enforces admin-only access
- ✅ Password reset works for admin

### Frontend Tests
- ✅ Users page accessible at `/users`
- ✅ Non-admin users see "Access Denied" message
- ✅ Admin can create users, toggle roles, reset passwords

---

## 📚 Documentation

- Created `docs/phase2-user-management.md` (this file)
- Updated `README.md` with Phase 2 summary

---

## 📊 Phase Status

| Task | Status |
|------|--------|
| User model with role column | ✅ Already implemented |
| Backend users router | ✅ Already implemented |
| RBAC middleware | ✅ Already implemented |
| Frontend Users page | ✅ Already implemented |
| Frontend API integration | ✅ Already implemented |
| Frontend route | ✅ Already implemented |
| Documentation | ✅ Completed |

---

## 🔄 Git Workflow

No additional commits needed for Phase 2 as it was already implemented.

---

## ⚠️ Notes

1. **Registration endpoint** — The frontend uses `POST /auth/register` for creating users, which is admin-only.

2. **Password validation** — The frontend requires minimum 8 characters for passwords.

3. **Role toggle** — Admins can toggle between `admin` and `staff` roles with a single click.

4. **Access control** — Only users with `role === 'admin'` can access the Users page.

---

*Next Phase: [Phase 3: Dashboard Improvements](phase3-dashboard-improvements.md)*
