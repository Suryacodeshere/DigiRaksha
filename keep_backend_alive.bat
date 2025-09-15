@echo off
title DigiRaksha Backend Keep-Alive Monitor
echo DigiRaksha AI Backend Keep-Alive Monitor
echo ========================================
echo.
echo This script will monitor and restart the backend if it goes offline
echo Backend URL: http://localhost:5000
echo.
echo Starting monitoring... (Press Ctrl+C to stop)
echo.

:loop
REM Check if backend is responding
curl -s -o nul -w "%%{http_code}" http://localhost:5000/health > temp_status.txt 2>nul
set /p status=<temp_status.txt
del temp_status.txt 2>nul

if "%status%" == "200" (
    echo [%date% %time%] Backend is healthy ^(HTTP %status%^) ✓
) else (
    echo [%date% %time%] Backend is down ^(HTTP %status%^) - Restarting...
    
    REM Kill any existing Python processes running the backend
    taskkill /F /IM python.exe /FI "WINDOWTITLE eq DigiRaksha Backend*" >nul 2>&1
    
    REM Wait a moment
    timeout /t 3 >nul
    
    REM Restart backend
    start "DigiRaksha Backend" python backend/app.py
    
    echo [%date% %time%] Backend restarted - waiting 15 seconds for initialization...
    timeout /t 15 >nul
)

REM Wait 30 seconds before next check
timeout /t 30 >nul
goto loop