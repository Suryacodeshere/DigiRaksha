@echo off
echo Starting Digi Raksha Services...

echo Starting Backend Service...
start "" "C:\Users\SURYA\Downloads\Half1\start_digi_raksha_backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Service...
start "" "C:\Users\SURYA\Downloads\Half1\start_digi_raksha_frontend.bat"

echo.
echo Digi Raksha Services are starting...
echo Backend: Check console window
echo Frontend: http://localhost:5174
echo.
echo Press any key to close this window...
pause >nul