@echo off
title DigiRaksha AI Chatbot Launcher
echo Starting DigiRaksha AI Chatbot with Semantic Understanding...
echo.

REM Kill any existing processes first
echo Cleaning up any existing processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Starting Backend Server (AI + Semantic Engine)...
start "DigiRaksha Backend" /D "%~dp0" python backend/app.py

echo Waiting for backend to initialize (20 seconds)...
timeout /t 20 >nul

echo Testing backend health...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend is healthy!
) else (
    echo ⚠️ Backend may still be starting...
)

echo Starting Frontend Development Server...
start "DigiRaksha Frontend" /D "%~dp0" npm run dev

echo Waiting for frontend to start...
timeout /t 10 >nul

echo.
echo ==========================================
echo 🚀 DigiRaksha AI Chatbot is READY!
echo ==========================================
echo.
echo 🔧 Backend (AI Service): http://localhost:5000
echo 🌐 Frontend (Website):   http://localhost:5174
echo.
echo 📱 Open your browser and go to: http://localhost:5174
echo.
echo ✨ Your AI now has SEMANTIC UNDERSTANDING!
echo Try asking questions like:
echo   • "How do I secure my UPI account?"
echo   • "Is cafe WiFi safe for payments?" 
echo   • "What if payment fails but money is cut?"
echo.
echo 💡 If AI shows 'Offline', wait 30 seconds and refresh the page
echo.
echo Press any key to close launcher (servers will keep running)...
pause > nul
