#!/usr/bin/env bash
# Start the PC Parts configurator (API + frontend dev server)
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting API server..."
conda run -n pc_parts bash -c "cd '$ROOT/api' && uvicorn main:app --reload --port 8000" &
API_PID=$!

echo "Starting frontend dev server..."
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "  API:      http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $API_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
