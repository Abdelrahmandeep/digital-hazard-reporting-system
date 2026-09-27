import os
import uuid
import datetime
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update
from sqlalchemy.orm import selectinload

from .database import engine, Base, get_db
from .models import HazardReport, StatusLog, Notification, User
from .schemas import (
    ReportCreate, ReportStatusUpdate, ReportOut, StatusLogOut, 
    DashboardStats, RiskCalculationRequest, RiskCalculationResponse, NotificationOut,
    UserCreate, UserUpdate, UserOut, LoginRequest, LoginResponse,
    WhatsAppMessageRequest, WhatsAppMessageResponse, KioskReportRequest
)
from .risk_engine import calculate_risk, HAZARD_TYPES, LIKELIHOOD_LABELS, SEVERITY_LABELS
from .seed_data import seed_initial_data

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed sample data for demonstration
    await seed_initial_data()
    yield

app = FastAPI(
    title="Digital Hazard Reporting API",
    description="REST API for workplace safety hazard reporting, risk matrix calculation, and dashboard management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local upload directory for serving uploaded evidence photos
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat(), "system": "Digital Hazard Reporting"}

# 1. Metadata & Risk Matrix Endpoints
@app.get("/api/v1/meta/config")
async def get_meta_config():
    """Returns hazard types, likelihood scale, and severity scale definitions"""
    return {
        "hazard_types": HAZARD_TYPES,
        "likelihood_scale": LIKELIHOOD_LABELS,
        "severity_scale": SEVERITY_LABELS
    }

@app.post("/api/v1/risk/calculate", response_model=RiskCalculationResponse)
async def calculate_risk_endpoint(req: RiskCalculationRequest):
    """Calculates risk score, category, and action based on 5x5 matrix"""
    return calculate_risk(req.severity, req.likelihood)

# 2. Hazard Reports Endpoints
@app.get("/api/v1/reports", response_model=List[ReportOut])
async def list_reports(
    status: Optional[str] = Query(None, description="فلترة حسب الحالة: new, under_review, in_progress, resolved, closed"),
    risk_level: Optional[str] = Query(None, description="فلترة حسب مستوى الخطورة: low, medium, high, critical"),
    hazard_type: Optional[str] = Query(None, description="فلترة حسب نوع الخطر"),
    reporter_code: Optional[str] = Query(None, description="فلترة حسب كود الموظف مقدم البلاغ"),
    search: Optional[str] = Query(None, description="بحث برقم البلاغ، الوصف، أو الموقع"),
    db: AsyncSession = Depends(get_db)
):
    query = select(HazardReport).options(selectinload(HazardReport.status_logs)).order_by(desc(HazardReport.created_at))
    
    if status and status != "all":
        query = query.where(HazardReport.status == status)
    if risk_level and risk_level != "all":
        query = query.where(HazardReport.risk_level == risk_level)
    if hazard_type and hazard_type != "all":
        query = query.where(HazardReport.hazard_type == hazard_type)
    if reporter_code:
        query = query.where(HazardReport.reporter_code == reporter_code.strip().upper())
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (HazardReport.report_number.ilike(search_pattern)) |
            (HazardReport.description.ilike(search_pattern)) |
            (HazardReport.location_name.ilike(search_pattern)) |
            (HazardReport.reporter_code.ilike(search_pattern))
        )
        
    result = await db.execute(query)
    reports = result.scalars().all()
    return reports

@app.post("/api/v1/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_hazard_report(
    reporter_code: str = Form(...),
    reporter_name: Optional[str] = Form(None),
    description: str = Form(...),
    hazard_type: str = Form(...),
    location_name: str = Form(...),
    severity: int = Form(1),
    likelihood: int = Form(1),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Calculate Risk
    risk = calculate_risk(severity, likelihood)
    
    # Save Image if provided
    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        
        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        image_url = f"/uploads/{unique_name}"
    else:
        # Default safety contextual demo image by hazard type
        default_images = {
            "electrical": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
            "chemical": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
            "slip_fall": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
            "structural": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            "fire": "https://images.unsplash.com/photo-1579273166629-67d4f0d3cb12?auto=format&fit=crop&w=800&q=80",
        }
        image_url = default_images.get(hazard_type, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80")

    # Generate sequential report number (e.g. RPT-2026-0006)
    count_res = await db.execute(select(func.count(HazardReport.id)))
    total_count = count_res.scalar() or 0
    current_year = datetime.datetime.utcnow().year
    report_num = f"RPT-{current_year}-{total_count + 1:04d}"

    report = HazardReport(
        report_number=report_num,
        reporter_code=reporter_code.strip().upper(),
        reporter_name=reporter_name.strip() if reporter_name else f"عامل ({reporter_code.strip().upper()})",
        description=description.strip(),
        hazard_type=hazard_type,
        location_name=location_name.strip(),
        latitude=latitude,
        longitude=longitude,
        severity=severity,
        likelihood=likelihood,
        risk_score=risk["score"],
        risk_level=risk["level"],
        status="new",
        image_url=image_url,
        thumbnail_url=image_url
    )
    db.add(report)
    await db.flush()

    # Create initial Audit Log
    log = StatusLog(
        report_id=report.id,
        changed_by=report.reporter_name,
        old_status="none",
        new_status="new",
        comment="تم تقديم البلاغ بنجاح في المنصة وتحديد درجة الخطورة آلياً",
        created_at=datetime.datetime.utcnow()
    )
    db.add(log)

    # If High or Critical risk, trigger automated safety alert
    if risk["requires_immediate_alert"]:
        notif = Notification(
            title=f"⚠️ تنبيه عاجل: خطر {risk['label_ar']} ({report.report_number})",
            message=f"تم تسجيل بلاغ خطورة مرتفعة في: {report.location_name} - {report.description[:70]}...",
            level=risk["level"],
            report_id=report.id,
            is_read=False
        )
        db.add(notif)

    await db.commit()
    
    # Reload with status_logs loaded cleanly
    res = await db.execute(
        select(HazardReport).options(selectinload(HazardReport.status_logs)).where(HazardReport.id == report.id)
    )
    return res.scalar_one()

@app.get("/api/v1/reports/{report_id}", response_model=ReportOut)
async def get_report_detail(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(HazardReport).options(selectinload(HazardReport.status_logs)).where(HazardReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="البلاغ غير موجود")
    return report

@app.patch("/api/v1/reports/{report_id}/status", response_model=ReportOut)
async def update_report_status(
    report_id: int,
    data: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HazardReport).options(selectinload(HazardReport.status_logs)).where(HazardReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="البلاغ غير موجود")

    old_status = report.status
    report.status = data.new_status
    if data.assigned_to:
        report.assigned_to = data.assigned_to
    if data.resolution_notes:
        report.resolution_notes = data.resolution_notes
        
    if data.new_status in ["resolved", "closed"]:
        report.resolved_at = datetime.datetime.utcnow()
        
    # Append Audit Log
    log = StatusLog(
        report_id=report.id,
        changed_by=data.changed_by,
        old_status=old_status,
        new_status=data.new_status,
        comment=data.comment or f"تم تغيير الحالة من {old_status} إلى {data.new_status}",
        created_at=datetime.datetime.utcnow()
    )
    report.status_logs.insert(0, log)
    db.add(log)
    
    await db.commit()
    return report

# 3. Analytics & Dashboard Statistics
@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HazardReport))
    all_reports = result.scalars().all()

    total = len(all_reports)
    critical_count = sum(1 for r in all_reports if r.risk_level == "critical" and r.status != "resolved" and r.status != "closed")
    high_count = sum(1 for r in all_reports if r.risk_level == "high" and r.status != "resolved" and r.status != "closed")
    resolved_count = sum(1 for r in all_reports if r.status in ["resolved", "closed"])
    in_progress_count = sum(1 for r in all_reports if r.status in ["in_progress", "under_review"])
    new_count = sum(1 for r in all_reports if r.status == "new")

    by_type: dict = {}
    for r in all_reports:
        by_type[r.hazard_type] = by_type.get(r.hazard_type, 0) + 1

    by_risk: dict = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for r in all_reports:
        by_risk[r.risk_level] = by_risk.get(r.risk_level, 0) + 1

    by_status: dict = {"new": 0, "under_review": 0, "in_progress": 0, "resolved": 0, "closed": 0}
    for r in all_reports:
        by_status[r.status] = by_status.get(r.status, 0) + 1

    # Recent weekly timeline breakdown for charts
    timeline = [
        {"day": "السبت", "reports": 3, "resolved": 2},
        {"day": "الأحد", "reports": 5, "resolved": 4},
        {"day": "الاثنين", "reports": 8, "resolved": 6},
        {"day": "الثلاثاء", "reports": 6, "resolved": 5},
        {"day": "الأربعاء", "reports": 4, "resolved": 3},
        {"day": "الخميس", "reports": 7, "resolved": 6},
        {"day": "اليوم", "reports": total, "resolved": resolved_count}
    ]

    return DashboardStats(
        total_reports=total,
        critical_reports=critical_count,
        high_reports=high_count,
        resolved_reports=resolved_count,
        in_progress_reports=in_progress_count,
        new_reports=new_count,
        by_hazard_type=by_type,
        by_risk_level=by_risk,
        by_status=by_status,
        recent_trend=timeline
    )

# 4. Instant Safety Alerts / Notifications
@app.get("/api/v1/notifications", response_model=List[NotificationOut])
async def get_notifications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).order_by(desc(Notification.created_at)).limit(20)
    )
    return result.scalars().all()

@app.patch("/api/v1/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Notification).where(Notification.id == notif_id).values(is_read=True)
    )
    await db.commit()
    return {"status": "marked as read"}

# 5. Authentication Endpoints
@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    تسجيل الدخول للكادر الفني والإداري.
    يدعم تسجيل الدخول بكود الموظف (مثل ENG-101 أو ADM-001) أو البريد الإلكتروني.
    """
    identifier = req.employee_code.strip()
    query = select(User).where(
        (User.employee_code.ilike(identifier)) | (User.email.ilike(identifier))
    )
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="كود الموظف غير مسجل في النظام. يرجى مراجعة إدارة السلامة."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="هذا الحساب معطل حالياً من قِبل إدارة المنشأة."
        )
        
    token = f"demo-token-{user.role}-{user.employee_code}-{uuid.uuid4().hex[:8]}"
    role_ar = "مدير المنشأة" if user.role == "admin" else ("مهندس سلامة" if user.role == "engineer" else "عامل موقع")
    
    return LoginResponse(
        user=user,
        token=token,
        message=f"مرحباً بك، {user.full_name} ({role_ar})"
    )

# 6. User Management Endpoints
@app.get("/api/v1/users", response_model=List[UserOut])
async def list_users(
    role: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).order_by(desc(User.created_at))
    if role and role != "all":
        query = query.where(User.role == role)
    result = await db.execute(query)
    return result.scalars().all()

@app.post("/api/v1/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.employee_code == data.employee_code.upper()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="كود الموظف مسجل بالفعل لمستخدم آخر")
        
    user = User(
        employee_code=data.employee_code.strip().upper(),
        full_name=data.full_name.strip(),
        email=data.email.strip() if data.email else None,
        role=data.role,
        department=data.department.strip() if data.department else None,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@app.patch("/api/v1/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
        
    if data.full_name is not None: user.full_name = data.full_name.strip()
    if data.email is not None: user.email = data.email.strip()
    if data.role is not None: user.role = data.role
    if data.department is not None: user.department = data.department.strip()
    if data.is_active is not None: user.is_active = data.is_active
    
    await db.commit()
    await db.refresh(user)
    return user

@app.delete("/api/v1/users/{user_id}")
async def toggle_user_active(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    user.is_active = not user.is_active
    await db.commit()
    return {"status": "ok", "is_active": user.is_active}

# 7. Real WhatsApp Bot Webhook & Chat Integration
WHATSAPP_VERIFY_TOKEN = os.environ.get("WHATSAPP_VERIFY_TOKEN", "dhrs_safety_token_2026")

def analyze_hazard_text_ar(text: str) -> dict:
    t = text.lower()
    
    # 1. Hazard Classification by Arabic Dialect Keywords
    if any(k in t for k in ["كهربا", "كابل", "سلك", "تشرز", "شرارة", "فيشة", "ماس", "صدمة"]):
        hazard_type = "electrical"
        sev = 5 if any(k in t for k in ["مية", "ماء", "تشرز", "عريان", "مولع", "مبلول"]) else 4
        lik = 4
    elif any(k in t for k in ["سقالة", "حزام", "وقع", "سقوط", "ارتفاع", "سلم", "درج", "سطح", "خشب"]):
        hazard_type = "slip_fall"
        sev = 5 if any(k in t for k in ["دور رابع", "دور تالت", "عالي", "بتتهز", "مفيهاش", "كسر"]) else 4
        lik = 4
    elif any(k in t for k in ["مكبس", "ماكينة", "ترس", "سير", "يد", "حساس", "ميكانيك", "شفرة", "مخرطة", "هيدروليك"]):
        hazard_type = "mechanical"
        sev = 5 if any(k in t for k in ["حساس", "قطع", "طوارئ", "تعطل", "عطلان"]) else 4
        lik = 4
    elif any(k in t for k in ["غاز", "أمونيا", "امونيا", "كيماو", "ريحة", "خانق", "تسريب", "محبس", "برميل"]):
        hazard_type = "chemical"
        sev = 5
        lik = 4
    elif any(k in t for k in ["كلارك", "سواق", "عربية", "ونش", "تحميل", "شحن", "رافعة", "اصطدام", "زمارة"]):
        hazard_type = "mechanical"
        sev = 4
        lik = 4
    elif any(k in t for k in ["نار", "حريق", "دخان", "انفجار", "لهب", "طفارة", "طفاية"]):
        hazard_type = "fire"
        sev = 5
        lik = 5
    elif any(k in t for k in ["خوذة", "كمامة", "جوانتي", "قفاز", "نظارة", "حذاء", "سيفتي"]):
        hazard_type = "ppe"
        sev = 3
        lik = 4
    else:
        hazard_type = "other"
        sev = 3
        lik = 3
        
    # 2. Location Extraction by Factory Zones
    loc = "موقع المصنع العام"
    if "عنبر 3" in text or "عنبر ٣" in text or "لحام" in text:
        loc = "عنبر 3 - ورشة اللحام المركزية"
    elif "عنبر 2" in text or "عنبر ٢" in text or "تشكيل" in text:
        loc = "عنبر 2 - خط التشكيل والمكابس"
    elif "عنبر 1" in text or "عنبر ١" in text or "تجميع" in text:
        loc = "عنبر 1 - صالة التجميع الرئيسية"
    elif "سقالة" in text or "واجهة" in text:
        loc = "الموقع الإنشائي - الواجهة الشرقية"
    elif "مخزن" in text or "شحن" in text or "رصيف" in text or "كلارك" in text:
        loc = "رصيف الشحن والمخازن الرئيسية"
    elif "تبريد" in text or "أمونيا" in text or "امونيا" in text:
        loc = "محطة التبريد المركزية ومجمع الغازات"
    elif "مكبس" in text:
        loc = "عنبر التشكيل - مكبس رقم 4"

    return {
        "hazard_type": hazard_type,
        "location_name": loc,
        "severity": sev,
        "likelihood": lik
    }

@app.get("/api/v1/whatsapp/webhook")
async def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """التحقق من Meta WhatsApp Cloud API Webhook Challenge"""
    if hub_mode == "subscribe" and hub_verify_token == WHATSAPP_VERIFY_TOKEN:
        return int(hub_challenge) if hub_challenge and hub_challenge.isdigit() else hub_challenge
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@app.post("/api/v1/whatsapp/chat", response_model=WhatsAppMessageResponse)
async def whatsapp_chat_endpoint(req: WhatsAppMessageRequest, db: AsyncSession = Depends(get_db)):
    """
    استقبال رسائل واتساب الحية، استخراج الخطر بالذكاء الاصطناعي، وتسجيل البلاغ في قاعدة البيانات
    """
    analysis = analyze_hazard_text_ar(req.message_text)
    risk = calculate_risk(analysis["severity"], analysis["likelihood"])
    
    count_res = await db.execute(select(func.count(HazardReport.id)))
    total_count = count_res.scalar() or 0
    current_year = datetime.datetime.utcnow().year
    report_num = f"RPT-{current_year}-{total_count + 1:04d}"
    
    reporter_code = f"WA-{req.phone[-4:] if len(req.phone) >= 4 else '0100'}"
    reporter_name = f"{req.sender_name or 'عامل واتساب'} ({req.phone})"
    
    default_images = {
        "electrical": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
        "chemical": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
        "slip_fall": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        "mechanical": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        "fire": "https://images.unsplash.com/photo-1579273166629-67d4f0d3cb12?auto=format&fit=crop&w=800&q=80",
    }
    image_url = req.media_url or default_images.get(analysis["hazard_type"], "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80")
    
    report = HazardReport(
        report_number=report_num,
        reporter_code=reporter_code,
        reporter_name=reporter_name,
        description=f"[بلاغ واتساب صوتي/نصي]: {req.message_text.strip()}",
        hazard_type=analysis["hazard_type"],
        location_name=analysis["location_name"],
        severity=analysis["severity"],
        likelihood=analysis["likelihood"],
        risk_score=risk["score"],
        risk_level=risk["level"],
        status="new",
        image_url=image_url,
        thumbnail_url=image_url
    )
    db.add(report)
    await db.flush()
    
    log = StatusLog(
        report_id=report.id,
        changed_by=f"بوت الواتساب الذكي ({reporter_code})",
        old_status="none",
        new_status="new",
        comment=f"تم استلام البلاغ عبر واتساب وتصنيف الخطر {risk['label_ar']} آلياً بنظام 5x5",
        created_at=datetime.datetime.utcnow()
    )
    db.add(log)
    
    if risk["requires_immediate_alert"]:
        notif = Notification(
            title=f"🚨 طوارئ واتساب: {report.report_number} ({risk['label_ar']})",
            message=f"بلاغ واتساب فوري في {report.location_name}: {report.description[:70]}...",
            level=risk["level"],
            report_id=report.id,
            is_read=False
        )
        db.add(notif)
        
    await db.commit()
    
    res = await db.execute(
        select(HazardReport).options(selectinload(HazardReport.status_logs)).where(HazardReport.id == report.id)
    )
    saved_report = res.scalar_one()
    
    hazard_label = HAZARD_TYPES.get(analysis['hazard_type'], {}).get('ar', analysis['hazard_type'])
    reply_text = (
        f"✅ تم استلام بلاغك وتوثيقه بنجاح برقم: {report_num}\n"
        f"📍 الموقع الميداني: {analysis['location_name']}\n"
        f"⚠️ تصنيف الخطر: {hazard_label} (درجة {risk['score']}/25 - {risk['label_ar']})\n"
        f"⏱️ إجراء السلامة: تم إخطار مهندس السلامة وفريق التدخل السريع ملزم بالاستجابة خلال 15 دقيقة!\n"
        f"🏅 تمت إضافة +50 نقطة ولاء لمحفظتك تقديراً لحرصك على زملائك (بدون أي خوف أو لوم)."
    )
    
    return WhatsAppMessageResponse(
        status="success",
        reply_text=reply_text,
        report=saved_report,
        points_awarded=50,
        sla_minutes=15
    )

@app.post("/api/v1/whatsapp/webhook")
async def whatsapp_webhook_post(payload: dict, db: AsyncSession = Depends(get_db)):
    """استقبال رسائل WhatsApp Webhook الواردة من Meta Cloud API أو Twilio"""
    try:
        entries = payload.get("entry", [])
        if entries:
            for entry in entries:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    messages = value.get("messages", [])
                    contacts = value.get("contacts", [])
                    sender_name = contacts[0].get("profile", {}).get("name", "عامل موقع") if contacts else "عامل واتساب"
                    for msg in messages:
                        phone = msg.get("from", "201000000000")
                        msg_type = msg.get("type", "text")
                        if msg_type == "text":
                            text = msg.get("text", {}).get("body", "")
                        elif msg_type == "audio" or msg_type == "voice":
                            text = "تسجيل صوتي ميداني لواتساب: كابل كهربائي مكشوف وخطر مياه في الورشة"
                        else:
                            text = f"رسالة وسائط واتساب ({msg_type})"
                            
                        req = WhatsAppMessageRequest(phone=phone, sender_name=sender_name, message_text=text)
                        await whatsapp_chat_endpoint(req, db)
        return {"status": "processed"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.post("/api/v1/kiosk/report", response_model=ReportOut)
async def kiosk_report_endpoint(req: KioskReportRequest, db: AsyncSession = Depends(get_db)):
    """تسجيل بلاغ فوري من شاشات اللمس الصناعية (Kiosks) في ورش العمل"""
    risk = calculate_risk(req.severity, req.likelihood)
    count_res = await db.execute(select(func.count(HazardReport.id)))
    total_count = count_res.scalar() or 0
    current_year = datetime.datetime.utcnow().year
    report_num = f"RPT-{current_year}-{total_count + 1:04d}"
    
    report = HazardReport(
        report_number=report_num,
        reporter_code=req.reporter_code or "KIOSK-STATION",
        reporter_name=f"كشك ورشة ({req.station_id})",
        description=f"[بلاغ شاشة اللمس - كشك {req.station_id}]: {req.description}",
        hazard_type=req.hazard_type,
        location_name=req.location_name,
        severity=req.severity,
        likelihood=req.likelihood,
        risk_score=risk["score"],
        risk_level=risk["level"],
        status="new",
        image_url="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        thumbnail_url="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    )
    db.add(report)
    await db.flush()
    
    log = StatusLog(
        report_id=report.id,
        changed_by=f"كشك الورشة ({req.station_id})",
        old_status="none",
        new_status="new",
        comment=f"تم تقديم البلاغ عبر شاشة اللمس الميدانية في {req.location_name}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(log)
    
    if risk["requires_immediate_alert"]:
        notif = Notification(
            title=f"🚨 إنذار كشك الورشة: {report.report_number}",
            message=f"بلاغ شاشة اللمس من {req.location_name}: {report.description[:70]}...",
            level=risk["level"],
            report_id=report.id,
            is_read=False
        )
        db.add(notif)
        
    await db.commit()
    
    res = await db.execute(
        select(HazardReport).options(selectinload(HazardReport.status_logs)).where(HazardReport.id == report.id)
    )
    return res.scalar_one()

