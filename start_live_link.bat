@echo off
chcp 65001 > nul
title تشغيل منصة الإبلاغ الرقمي والرابط المباشر
echo ======================================================================
echo 🏭 Digital Hazard Reporting System - تشغيل السيرفر والرابط المباشر
echo ======================================================================
echo.

start "DHRS Backend (8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
timeout /t 2 > nul
start "DHRS Frontend (5173)" cmd /k "cd frontend && npm run preview"
timeout /t 2 > nul
start "DHRS Live Tunnel" cmd /k "npx -y localtunnel --port 5173"

echo.
echo ✅ تم تشغيل السيرفر والواجهة والنفق المباشر!
echo 📱 الرابط المباشر لشبكة الواي فاي المنزلية: http://192.168.1.10:5173
echo 🔑 كود التحقق للنفق الخارجي إذا طُلب هو الـ IP العام لجهازك.
echo ======================================================================
echo.
pause
