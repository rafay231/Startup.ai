#!/bin/bash

# Kill any existing node processes
echo "Stopping any existing Node.js processes..."
pkill -f node || true

# Clear any existing log files
rm -f backend.log frontend.log

# Set environment variables
export PORT=12000
export VITE_API_URL="http://localhost:12000"

# Start the backend server
echo "Starting backend server on port 12000..."
cd /workspace/Startup.ai/WelcomeSystem
npm run start:server > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend server to start..."
sleep 5

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
  echo "Backend server started successfully with PID $BACKEND_PID"
  echo "Backend logs available in backend.log"
else
  echo "Failed to start backend server. Check backend.log for details."
  cat backend.log
  exit 1
fi

# Start the frontend server
echo "Starting frontend server on port 12002..."
cd /workspace/Startup.ai/WelcomeSystem
npm run start:client > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend server to start..."
sleep 10

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
  echo "Frontend server started successfully with PID $FRONTEND_PID"
  echo "Frontend logs available in frontend.log"
else
  echo "Failed to start frontend server. Check frontend.log for details."
  cat frontend.log
  exit 1
fi

echo "Both servers are now running!"
echo "Backend server: http://localhost:12000"
echo "Frontend server: http://localhost:12002"
echo "Health check: http://localhost:12002/health"
echo ""
echo "External URLs:"
echo "Backend: https://work-1-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
echo "Frontend: https://work-2-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
echo ""
echo "To view logs:"
echo "Backend logs: tail -f backend.log"
echo "Frontend logs: tail -f frontend.log"

# Keep the script running to maintain the background processes
echo "Press Ctrl+C to stop all servers"
wait