#!/bin/bash

echo "🚀 Starting ESP Tracker Application..."
echo "📍 Backend: http://192.168.0.94:3007"
echo "📍 Frontend: http://192.168.0.94:5000"
echo ""

# Start Backend
echo "🔧 Starting Backend Server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Server..."
cd ../medical-appointment-system
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📱 Backend PID: $BACKEND_PID"
echo "🎨 Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Access your application at:"
echo "   Frontend: http://192.168.0.94:5000"
echo "   Backend API: http://192.168.0.94:3007/api"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait 