@echo off
cd /d c:\projects\backend
c:\projects\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
