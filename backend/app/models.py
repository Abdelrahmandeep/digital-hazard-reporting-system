import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(30), default="worker")  # worker | engineer | admin
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # Reporter details (Worker submits quickly with employee code)
    reporter_code = Column(String(50), index=True, nullable=False)
    reporter_name = Column(String(150), nullable=True)
    
    # Hazard Information
    description = Column(Text, nullable=False)
    hazard_type = Column(String(50), index=True, nullable=False)
    location_name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Risk Assessment (5x5 Matrix)
    severity = Column(Integer, default=1)
    likelihood = Column(Integer, default=1)
    risk_score = Column(Integer, index=True, default=1)
    risk_level = Column(String(20), index=True, default="low")  # low | medium | high | critical
    
    # Status Management
    status = Column(String(30), index=True, default="new")  # new | under_review | in_progress | resolved | closed
    assigned_to = Column(String(150), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Media
    image_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationship to history logs
    status_logs = relationship("StatusLog", back_populates="report", cascade="all, delete-orphan", lazy="selectin", order_by="desc(StatusLog.created_at)")

class StatusLog(Base):
    __tablename__ = "status_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("hazard_reports.id"), nullable=False)
    changed_by = Column(String(150), nullable=False)
    old_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    report = relationship("HazardReport", back_populates="status_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String(20), default="info")  # info | warning | high | critical
    report_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
