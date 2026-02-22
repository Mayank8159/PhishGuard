#!/bin/bash

# PhishGuard Backend Startup Script for macOS/Linux

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          PhishGuard Backend Startup                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ Created .env - Please edit with your Supabase credentials"
    read -p "Press enter to continue..."
fi

# Check if virtual environment exists
if [ ! -d venv ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
pip list | grep -q fastapi
if [ $? -ne 0 ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Start the server
echo ""
echo "🚀 Starting PhishGuard API Server..."
echo ""
echo "📍 Local:        http://localhost:8000"
echo "📚 API Docs:     http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
