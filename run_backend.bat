@echo off
cd /d C:\projects\backend
C:\projects\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
