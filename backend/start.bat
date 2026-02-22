@echo off
REM PhishGuard Backend Startup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          PhishGuard Backend Startup                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ✓ Created .env - Please edit with your Supabase credentials
    pause
)

REM Check if virtual environment exists
if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Check if dependencies are installed
pip list | find "fastapi" >nul
if errorlevel 1 (
    echo 📥 Installing dependencies...
    pip install -r requirements.txt
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)

REM Start the server
echo.
echo 🚀 Starting PhishGuard API Server...
echo.
echo 📍 Local:        http://localhost:8000
echo 📚 API Docs:     http://localhost:8000/docs
echo 🔍 Health Check: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
