#!/usr/bin/env python3.11
import subprocess
import sys

subprocess.run([
    sys.executable,
    "-m", "uvicorn",
    "app.main:app",
    "--reload",
    "--host", "0.0.0.0",
    "--port", "8000"
])
