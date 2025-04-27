#!/bin/bash

# Kill any existing node processes
pkill -f node || true

# Start the backend server on port 12000
PORT=12000 npm run dev &
SERVER_PID=$!

# Wait for the server to start
sleep 5

# Start the frontend on port 12001
cd client && npx vite --port 12001 &
CLIENT_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down..."
  kill $SERVER_PID $CLIENT_PID
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM

# Keep the script running
wait