@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting fraud detection server...
python app.py

pause
