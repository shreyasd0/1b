@echo off
cd /d C:\projects\backend
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
