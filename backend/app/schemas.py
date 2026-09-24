from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Risk Engine Schemas
class RiskCalculationRequest(BaseModel):
    severity: int = Field(..., ge=1, le=5, description="شدة الضرر 1-5")
    likelihood: int = Field(..., ge=1, le=5, description="احتمالية الحدوث 1-5")

class RiskCalculationResponse(BaseModel):
    score: int
    level: str
    label_ar: str
    color: str
    badge_bg: str
    action_ar: str
    requires_immediate_alert: bool
    severity: int
    likelihood: int
    severity_info: Optional[Dict[str, Any]] = None
    likelihood_info: Optional[Dict[str, Any]] = None

# Hazard Report Schemas
class ReportCreate(BaseModel):
    reporter_code: str = Field(..., min_length=2, max_length=50)
    reporter_name: Optional[str] = None
    description: str = Field(..., min_length=5)
    hazard_type: str = Field(..., min_length=2)
    location_name: str = Field(..., min_length=2)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: int = Field(1, ge=1, le=5)
    likelihood: int = Field(1, ge=1, le=5)

class ReportStatusUpdate(BaseModel):
    new_status: str = Field(..., pattern="^(new|under_review|in_progress|resolved|closed)$")
    changed_by: str = Field(..., min_length=2)
    comment: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class StatusLogOut(BaseModel):
    id: int
    changed_by: str
    old_status: str
    new_status: str
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ReportOut(BaseModel):
    id: int
    report_number: str
    reporter_code: str
    reporter_name: Optional[str]
    description: str
    hazard_type: str
    location_name: str
    latitude: Optional[float]
    longitude: Optional[float]
    severity: int
    likelihood: int
    risk_score: int
    risk_level: str
    status: str
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    image_url: Optional[str]
    thumbnail_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    status_logs: List[StatusLogOut] = []

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class DashboardStats(BaseModel):
    total_reports: int
    critical_reports: int
    high_reports: int
    resolved_reports: int
    in_progress_reports: int
    new_reports: int
    by_hazard_type: Dict[str, int]
    by_risk_level: Dict[str, int]
    by_status: Dict[str, int]
    recent_trend: List[Dict[str, Any]]

# Notification Schema
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    level: str
    report_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# User Management Schemas
class UserCreate(BaseModel):
    employee_code: str = Field(..., min_length=2, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=150)
    email: Optional[str] = None
    role: str = Field("worker", pattern="^(worker|engineer|admin)$")
    department: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(worker|engineer|admin)$")
    department: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    employee_code: str
    full_name: str
    email: Optional[str]
    role: str
    department: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication Schemas
class LoginRequest(BaseModel):
    employee_code: str = Field(..., description="كود الموظف أو البريد الإلكتروني")
    password: Optional[str] = Field(None, description="كلمة المرور أو الرمز السري")

class LoginResponse(BaseModel):
    user: UserOut
    token: str
    message: str


