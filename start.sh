#!/bin/bash
set -e

echo "================================================"
echo "  eLingo - Telugu Dictionary Setup"
echo "================================================"

# Check dependencies
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required. Please install it."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Please install it."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required. Please install it."; exit 1; }

# Backend setup
echo ""
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -q

# Start backend in background
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend running (PID: $BACKEND_PID)"

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend
npm install --silent
npm run build
cd ..

echo ""
echo "================================================"
echo "  eLingo is ready!"
echo "  Open: http://localhost:8000"
echo "================================================"

# Seed initial data
sleep 2
curl -s -X POST http://localhost:8000/api/seed > /dev/null
echo "Sample Telugu words loaded!"

wait $BACKEND_PID
