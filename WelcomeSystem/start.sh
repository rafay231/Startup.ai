#!/bin/bash

# Kill any existing node processes
pkill -f "node" || true

# Set environment variables
export PORT=12000
export VITE_PORT=12001
export VITE_API_URL=http://localhost:12000

# Start the backend server
echo "Starting backend server on port $PORT..."
cd /workspace/Startup.ai/WelcomeSystem
NODE_ENV=development npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Backend server failed to start. Check backend.log for details."
  cat backend.log
  exit 1
fi

echo "Backend server started with PID $BACKEND_PID"
echo "Backend logs are being written to backend.log"

# Start the frontend server
echo "Starting frontend server on port $VITE_PORT..."
echo "Frontend URL: https://work-2-vvzgqwkpnqjlcmyq.prod-runtime.all-hands.dev"
cd /workspace/Startup.ai/WelcomeSystem
npx vite --port $VITE_PORT --host 0.0.0.0

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM