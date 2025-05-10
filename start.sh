#!/bin/bash

# Kill any existing node processes
echo "Stopping any existing Node.js processes..."
pkill -f node || true

# Clear any existing log files
rm -f server1.log server2.log

# Start the first server on port 12000
echo "Starting first server on port 12000..."
cd /workspace/Startup.ai/WelcomeSystem
PORT=12000 node new-server.js > server1.log 2>&1 &
SERVER1_PID=$!

# Wait for first server to start
echo "Waiting for first server to start..."
sleep 3

# Check if first server is running
if ps -p $SERVER1_PID > /dev/null; then
  echo "First server started successfully with PID $SERVER1_PID"
  echo "First server logs available in server1.log"
else
  echo "Failed to start first server. Check server1.log for details."
  cat server1.log
  exit 1
fi

# Start the second server on port 12001
echo "Starting second server on port 12001..."
cd /workspace/Startup.ai/WelcomeSystem
PORT=12001 node second-server.js > server2.log 2>&1 &
SERVER2_PID=$!

# Wait for second server to start
echo "Waiting for second server to start..."
sleep 3

# Check if second server is running
if ps -p $SERVER2_PID > /dev/null; then
  echo "Second server started successfully with PID $SERVER2_PID"
  echo "Second server logs available in server2.log"
else
  echo "Failed to start second server. Check server2.log for details."
  cat server2.log
  exit 1
fi

echo "Both servers are now running!"
echo "First server: http://localhost:12000"
echo "Second server: http://localhost:12001"
echo "Health check: http://localhost:12000/api/health or http://localhost:12001/api/health"
echo "AI Demo: http://localhost:12000/ai-demo.html or http://localhost:12001/ai-demo.html"
echo "Root pages: http://localhost:12000/ or http://localhost:12001/"
echo ""
echo "External URLs:"
echo "First server: https://work-1-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
echo "Second server: https://work-2-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
echo ""
echo "To view logs:"
echo "First server logs: tail -f server1.log"
echo "Second server logs: tail -f server2.log"

# Keep the script running to maintain the background processes
echo "Press Ctrl+C to stop all servers"
wait