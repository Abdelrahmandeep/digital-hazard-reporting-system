@echo off
chcp 65001 > nul
title Digital Hazard Reporting System - تشغيل النظام
echo ======================================================================
echo 🏭 Digital Hazard Reporting System (DHRS v2.0)
echo جاري إعداد وتشغيل المنصة بالكامل محلياً...
echo ======================================================================
echo.

:: 1. إعداد البيئة الخلفية (Python Backend)
if not exist ".venv" (
    echo [1/4] جاري إنشاء البيئة الافتراضية للبايثون...
    python -m venv .venv
)

echo [2/4] تثبيت مكتبات الباك إند (FastAPI, SQLAlchemy, etc.)...
call .venv\Scripts\pip install -r requirements.txt --quiet

:: 2. إعداد الواجهة الأمامية (React Frontend)
if not exist "frontend\node_modules" (
    echo [3/4] تثبيت حزم الواجهة الأمامية (npm install)...
    cd frontend
    call npm install --quiet
    cd ..
)

:: 3. تشغيل السيرفر والواجهة معاً
echo [4/4] تشغيل الخادم والواجهة الأمامية...
start "DHRS Backend Server (Port 8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000"
start "DHRS Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo ✅ تم بدء تشغيل المنصة بنجاح!
echo 🌐 الواجهة الأمامية: http://localhost:5173
echo 🔌 توثيق السيرفر (Swagger): http://localhost:8000/docs
echo ======================================================================
echo.
timeout /t 3 > nul
start http://localhost:5173
