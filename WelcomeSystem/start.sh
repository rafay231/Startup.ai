#!/bin/bash

# Kill any existing node processes
pkill -f "node" || true

# Set environment variables
export PORT=12000
export NODE_ENV=development

# Build the frontend first
echo "Building frontend..."
cd /workspace/Startup.ai/WelcomeSystem
npm run build

# Start the server
echo "Starting server on port $PORT..."
cd /workspace/Startup.ai/WelcomeSystem
node new-server.js > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
  echo "Server failed to start. Check server.log for details."
  cat server.log
  exit 1
fi

echo "Server started with PID $SERVER_PID"
echo "Server logs are being written to server.log"
echo "Server URL: https://work-1-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
echo "AI Demo URL: https://work-1-emnquxgnqihxybsn.prod-runtime.all-hands.dev/ai-demo.html"

# Keep the script running to see logs
tail -f server.log

# Function to handle script termination
cleanup() {
  echo "Shutting down server..."
  kill $SERVER_PID
  exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM