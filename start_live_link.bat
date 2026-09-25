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
start "DHRS Cloudflare Live Tunnel" cmd /k "cloudflared.exe tunnel --url http://localhost:5173"

echo.
echo ✅ تم تشغيل السيرفر والواجهة ونفق Cloudflare المباشر بنجاح!
echo 📱 الرابط المباشر لشبكة الواي فاي المنزلية: http://192.168.1.10:5173
echo 🌐 الرابط العالمي السريع سيظهر في نافذة Cloudflare بدون أي شاشات تحقق أو أرقام سرية!
echo ======================================================================

echo.
pause
