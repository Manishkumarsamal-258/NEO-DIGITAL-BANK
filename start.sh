#!/bin/bash

# NeoBank - Start Both Backend & Frontend
# ----------------------------------------
# This script starts the Spring Boot backend and Vite frontend simultaneously.

set -e

echo "╔════════════════════════════════════════════╗"
echo "║ 🏦 NeoBank-Developed By Manish Kumar Samal  ║"
echo "╚════════════════════════════════════════════╝"

# ── 1. Check MySQL is running ──────────────────────────────
echo ""
echo "📡 Checking MySQL..."
if mysqladmin ping -u root -pManish@258 --silent 2>/dev/null; then
    echo "   ✅ MySQL is running"
else
    echo "   ❌ MySQL is not running. Starting MySQL..."
    brew services start mysql 2>/dev/null || sudo service mysql start 2>/dev/null || echo "   ⚠️  Please start MySQL manually"
    sleep 2
fi

# ── 2. Start Backend ───────────────────────────────────────
echo ""
echo "🚀 Starting backend (Spring Boot on port 8080)..."
cd neobank-backend
mvn spring-boot:run > /tmp/neobank-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "   ⏳ Waiting for backend to start..."
for i in $(seq 1 30); do
    if curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/auth/login -X POST \
        -H 'Content-Type: application/json' \
        -d '{"email":"alice@neobank.com","password":"password123"}' 2>/dev/null | grep -q 200; then
        echo "   ✅ Backend started (PID: $BACKEND_PID)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Backend failed to start. Check logs: tail -f /tmp/neobank-backend.log"
    fi
    sleep 2
done

# ── 3. Start Frontend ──────────────────────────────────────
echo ""
echo "🚀 Starting frontend (Vite on port 5173)..."
npm run dev > /tmp/neobank-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo "   ✅ Frontend started (PID: $FRONTEND_PID)"

# ── 4. Show Status ─────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║        ✅ NeoBank is Running!             ║"
echo "╠════════════════════════════════════════════╣"
echo "║                                            ║"
echo "║   🌐 Frontend: http://localhost:5173       ║"
echo "║   🔧 Backend:  http://localhost:8080       ║"
echo "║   🗄️  Database: MySQL (neobank)            ║"
echo "║                                            ║"
echo "║   Demo Logins:                             ║"
echo "║   👤 Customer: alice@neobank.com / password123 ║"
echo "║   👤 Teller:   teller@neobank.com / teller123 ║"
echo "║   👤 Admin:    admin@neobank.com / admin123   ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/neobank-backend.log"
echo "   Frontend: tail -f /tmp/neobank-frontend.log"
echo ""
echo "🛑 To stop: kill $BACKEND_PID $FRONTEND_PID"
