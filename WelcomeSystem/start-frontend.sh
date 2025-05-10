#!/bin/bash

# Set environment variables
export VITE_PORT=12001
export VITE_API_URL=http://localhost:12000

# Start the frontend server
echo "Starting frontend server on port $VITE_PORT..."
echo "Frontend URL: https://work-2-emnquxgnqihxybsn.prod-runtime.all-hands.dev"
cd /workspace/Startup.ai/WelcomeSystem
npx vite --port $VITE_PORT --host 0.0.0.0