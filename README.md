# 🏭 نظام الإبلاغ الرقمي عن المخاطر (Digital Hazard Reporting System - DHRS)

منصة رقمية سريعة ومتكاملة للإبلاغ الفوري عن مخاطر بيئات العمل الصناعية والإنشائية، مدعومة بمصفوفة تقييم المخاطر المعيارية (5x5 Risk Matrix)، ولوحة تحكم تفاعلية لمهندسي السلامة والمديرين.

---

## ✨ المميزات الرئيسية

1. **إبلاغ فوري بدون تسجيل معقد (Worker Flow)**:
   - يدخل العامل بكود الموظف فقط (مثل: `EMP-408`).
   - تحديد نوع الخطر وموقعه بدقة مع إمكانية رفع صورة إثبات مباشرة.
   - حساب فوري لدرجة الخطورة عبر منزلقات شدة الضرر (Severity) واحتمالية الحدوث (Likelihood).
   - توثيق البلاغ برقم مرجعي معتمد (مثل: `RPT-2026-0006`).

2. **مصفوفة المخاطر المعيارية (5x5 Risk Matrix)**:
   - تقييم موضوعي من 1 إلى 25 وفقاً لمعايير **OSHA** و **ISO 45001**.
   - 🟢 **منخفض (1-5)** | 🟡 **متوسط (6-9)** | 🟠 **عالي (10-16)** | 🔴 **حرج / طارئ (17-25)**.
   - تفعيل تنبيهات فورية للمخاطر العالية والحرجة.
   - خريطة حرارية تفاعلية (Interactive Heatmap) لجميع البلاغات.

3. **لوحة تحكم مهندس السلامة (Safety Engineer Dashboard)**:
   - رصد لحظي للإحصائيات ونسب الإنجاز.
   - رسوم بيانية تحليلية تفاعلية (Recharts): توزيع المخاطر، وفئات الأخطار، وسرعة الاستجابة الأسبوعية.
   - فلترة متقدمة حسب درجة الخطورة، نوع الخطر، وحالة المعالجة.
   - نافذة تفاصيل البلاغ وتحديث الحالة (جديد ◄ قيد المعالجة ◄ تم الحل) وتكليف المهندس المسؤول.

4. **سجل تدقيق تاريخي غير قابل للتعديل (Audit Trail)**:
   - حفظ تاريخ وتوقيت كل تغيير في حالة البلاغ واسم المسؤول والإجراءات التصحيحية.

5. **تصميم Mobile-First وعربي بالكامل (RTL-First)**:
   - واجهة داكنة مريحة للعين (Dark Glassmorphism) مع خط **Cairo** العربي العصري.

---

## 🛠️ البنية التقنية (Tech Stack)

- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS v4 + Glassmorphism
  - Recharts (Analytics & Charts)
  - Lucide React (Icons)
  - Canvas Confetti
- **Backend**:
  - Python 3.12+ & FastAPI (Async API)
  - SQLAlchemy 2.0 (Async ORM)
  - SQLite (aiosqlite) محلياً مع جاهزية كاملة للربط بـ PostgreSQL (Neon / Railway)
  - Pydantic v2 (Validation & Schemas)
  - Pillow & Python-multipart (Uploads)

---

## 🚀 تشغيل المشروع محلياً (Quick Start)

### 1. المتطلبات
- Node.js (v18+)
- Python (v3.10+)

### 2. تشغيل السيرفر الخلفي (Backend)
```powershell
# من المجلد الرئيسي للمشروع:
# تفعيل البيئة الافتراضية
.\.venv\Scripts\activate

# تشغيل خادم FastAPI
uvicorn backend.app.main:app --reload --port 8000
```
> توثيق الـ API التفاعلي (Swagger UI): `http://127.0.0.1:8000/docs`

### 3. تشغيل الواجهة الأمامية (Frontend)
```powershell
# من مجلد frontend:
cd frontend
npm install
npm run dev
```
> افتح المتصفح على: `http://127.0.0.1:5173`

---

## 📂 هيكل المجلدات

```
Digital Hazard Reporting System/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & endpoints
│   │   ├── models.py        # SQLAlchemy database models
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── database.py      # Async database connection
│   │   ├── risk_engine.py   # 5x5 Risk Matrix calculation engine
│   │   └── seed_data.py     # Initial industrial hazard sample reports
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── reports/ReportWizard.tsx
│   │   │   ├── dashboard/StatsOverview.tsx
│   │   │   ├── dashboard/AnalyticsCharts.tsx
│   │   │   ├── dashboard/RiskHeatmap.tsx
│   │   │   ├── dashboard/ReportsFeed.tsx
│   │   │   └── notifications/NotificationDrawer.tsx
│   │   ├── services/api.ts
│   │   ├── utils/riskMatrix.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   ├── package.json
│   └── index.html
└── README.md
```
