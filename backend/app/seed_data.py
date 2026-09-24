import datetime
from sqlalchemy import select
from .database import AsyncSessionLocal
from .models import HazardReport, StatusLog, Notification, User
from .risk_engine import calculate_risk

SAMPLE_REPORTS = [
    {
        "report_number": "RPT-2026-0001",
        "reporter_code": "EMP-408",
        "reporter_name": "أحمد الشناوي",
        "description": "وجود سلك كهربائي رئيسي مكشوف بجهد عالي بالقرب من ممر الرافعات الشوكية في المستودع رقم 3 مع وجود تسريب مياه سطحي قريب.",
        "hazard_type": "electrical",
        "location_name": "المستودع الرئيسي - ممر الرافعات 3",
        "latitude": 29.9865,
        "longitude": 31.2985,
        "severity": 4,
        "likelihood": 4,
        "status": "in_progress",
        "assigned_to": "م. كريم عبد الرحمن (سلامة صناعية)",
        "resolution_notes": "تم عزل القاطع الرئيسي فوراً وطلب فريق الصيانة الكهربائية لتركيب أنبوب حماية معزول.",
        "image_url": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80",
        "hours_ago": 18
    },
    {
        "report_number": "RPT-2026-0002",
        "reporter_code": "EMP-112",
        "reporter_name": "محمود إبراهيم",
        "description": "تسرب مادة كيميائية سائلة (مذيب صناعي) من إحدى البراميل في قسم المعالجة مع تصاعد أبخرة نفاذة بدون تهوية كافية.",
        "hazard_type": "chemical",
        "location_name": "وحدة المعالجة الكيميائية - خط B",
        "latitude": 29.9870,
        "longitude": 31.2990,
        "severity": 5,
        "likelihood": 4,
        "status": "new",
        "assigned_to": None,
        "resolution_notes": None,
        "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
        "hours_ago": 2
    },
    {
        "report_number": "RPT-2026-0003",
        "reporter_code": "EMP-530",
        "reporter_name": "ياسر ممدوح",
        "description": "أرضية زلقة جداً بسبب تسرب زيت هيدروليكي أمام منطقة التعبئة والتغليف، مما يسبب خطورة انزلاق وسقوط العمال.",
        "hazard_type": "slip_fall",
        "location_name": "صالة الإنتاج رقم 2 - خط التعبئة",
        "latitude": 29.9860,
        "longitude": 31.2975,
        "severity": 3,
        "likelihood": 3,
        "status": "resolved",
        "assigned_to": "م. طارق المهدي",
        "resolution_notes": "تم وضع رمال ماصة وتنظيف الزيت بالكامل بمواد خاصة ووضع علامات تحذيرية حتى جفاف الأرضية.",
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        "hours_ago": 48
    },
    {
        "report_number": "RPT-2026-0004",
        "reporter_code": "EMP-219",
        "reporter_name": "سعيد فؤاد",
        "description": "سقالة بناء في منطقة التوسعات غير مثبتة بإحكام في الجزء العلوي، مع ملاحظة اهتزاز ملحوظ أثناء مرور الرياح وصعود العمال.",
        "hazard_type": "structural",
        "location_name": "موقع الإنشاءات الجديد - البوابة الشرقية",
        "latitude": 29.9880,
        "longitude": 31.3005,
        "severity": 5,
        "likelihood": 3,
        "status": "under_review",
        "assigned_to": "م. مصطفى العوضي",
        "resolution_notes": "جاري التنسيق مع مقاول السقالات لإعادة التحزيم وإيقاف العمل على السقالة حتى الفحص الفني.",
        "image_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        "hours_ago": 6
    },
    {
        "report_number": "RPT-2026-0005",
        "reporter_code": "EMP-304",
        "reporter_name": "عمر خالد",
        "description": "انسداد مخرج طوارئ وتراكم صناديق خشبية ومعدات تالفة أمام باب الهروب المخصص لصالة اللحام.",
        "hazard_type": "fire",
        "location_name": "ورشة اللحام والميكانيكا - مخرج الطوارئ رقم 4",
        "latitude": 29.9855,
        "longitude": 31.2965,
        "severity": 4,
        "likelihood": 2,
        "status": "resolved",
        "assigned_to": "م. كريم عبد الرحمن",
        "resolution_notes": "تم تفريغ المخرج ونقل المخلفات إلى ساحة الخردة وتنبيه مشرف الوردية بعدم التخزين في المسارات.",
        "image_url": "https://images.unsplash.com/photo-1579273166629-67d4f0d3cb12?auto=format&fit=crop&w=800&q=80",
        "hours_ago": 72
    }
]

async def seed_initial_data():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(HazardReport))
        existing = result.scalars().first()
        if existing:
            # Check if users exist
            user_res = await session.execute(select(User))
            if not user_res.scalars().first():
                await _seed_users(session)
            return

        now = datetime.datetime.utcnow()
        for item in SAMPLE_REPORTS:
            risk = calculate_risk(item["severity"], item["likelihood"])
            created_at = now - datetime.timedelta(hours=item["hours_ago"])
            
            report = HazardReport(
                report_number=item["report_number"],
                reporter_code=item["reporter_code"],
                reporter_name=item["reporter_name"],
                description=item["description"],
                hazard_type=item["hazard_type"],
                location_name=item["location_name"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                severity=item["severity"],
                likelihood=item["likelihood"],
                risk_score=risk["score"],
                risk_level=risk["level"],
                status=item["status"],
                assigned_to=item["assigned_to"],
                resolution_notes=item["resolution_notes"],
                image_url=item["image_url"],
                thumbnail_url=item["image_url"],
                created_at=created_at,
                resolved_at=now if item["status"] == "resolved" else None
            )
            session.add(report)
            await session.flush()

            # Add status audit log
            log = StatusLog(
                report_id=report.id,
                changed_by=item["reporter_name"] or "النظام التلقائي",
                old_status="none",
                new_status="new",
                comment="تم استلام البلاغ وتصنيفه تلقائياً بمصفوفة المخاطر",
                created_at=created_at
            )
            session.add(log)

            if item["status"] in ["under_review", "in_progress", "resolved"]:
                log2 = StatusLog(
                    report_id=report.id,
                    changed_by=item["assigned_to"] or "مهندس السلامة",
                    old_status="new",
                    new_status=item["status"],
                    comment=item["resolution_notes"] or "متابعة البلاغ وتكليف فرق العمل",
                    created_at=created_at + datetime.timedelta(hours=1)
                )
                session.add(log2)

            # Add notification for high/critical risks
            if risk["requires_immediate_alert"]:
                notif = Notification(
                    title=f"تنبيه خطر {risk['label_ar']}: {report.report_number}",
                    message=f"تم الإبلاغ عن {item['description'][:80]}... في {report.location_name}",
                    level=risk["level"],
                    report_id=report.id,
                    is_read=(item["status"] == "resolved"),
                    created_at=created_at
                )
                session.add(notif)

        await _seed_users(session)
        await session.commit()

async def _seed_users(session):
    users = [
        User(employee_code="EMP-408", full_name="أحمد الشناوي", email="ahmed.sh@factory.local", role="worker", department="التخزين والمستودعات"),
        User(employee_code="EMP-112", full_name="محمود إبراهيم", email="m.ibrahim@factory.local", role="worker", department="المعالجة الكيميائية"),
        User(employee_code="EMP-530", full_name="ياسر ممدوح", email="yasser.m@factory.local", role="worker", department="صالة الإنتاج والتجميع"),
        User(employee_code="ENG-101", full_name="م. كريم عبد الرحمن", email="kareem.eng@factory.local", role="engineer", department="السلامة والصحة المهنية (HSE)"),
        User(employee_code="ENG-102", full_name="م. طارق المهدي", email="tarek.eng@factory.local", role="engineer", department="التفتيش والوقاية الميدانية"),
        User(employee_code="ADM-001", full_name="د. وليد النجار", email="waleed.admin@factory.local", role="admin", department="الإدارة العامة للسلامة والجودة"),
    ]
    for u in users:
        session.add(u)
    await session.commit()

