# NeoBank — Deployment Guide

## Overview

NeoBank can be deployed in several configurations:

1. **Demo Mode (No Backend)** — Frontend only, works entirely in the browser
2. **Docker Compose (Full Stack)** — Frontend + Backend + MySQL
3. **Vercel / Netlify (Demo Mode)** — Frontend on static hosting
4. **Railway (Full Stack)** — Automated deployment
5. **Manual (Production)** — Custom setup

---

## 1. Demo Mode (No Backend Required)

The fastest way to run NeoBank. No backend, no database needed. All data is stored in localStorage.

### Local Development

```bash
# Install dependencies
npm install

# Start with demo mode
VITE_DEMO_MODE=true npm run dev
# Or: VITE_DEMO_MODE=true bun run dev
```

The app runs at `http://localhost:5173` with full functionality.

### Vercel Deployment (Demo Mode)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (will prompt for environment variable)
vercel

# Set environment variable in Vercel Dashboard:
# VITE_DEMO_MODE = true
```

Or use the Vercel import flow:
1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `VITE_DEMO_MODE = true`
4. Deploy

### Netlify Deployment (Demo Mode)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variable in Netlify Dashboard:
# VITE_DEMO_MODE = true
```

---

## 2. Docker Compose (Full Stack)

Deploy the complete stack: React frontend + Spring Boot backend + MySQL database.

### Prerequisites

- Docker & Docker Compose installed
- Git

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd NeoBank

# 2. Start all services
docker compose up -d

# 3. Wait for services to be healthy
docker compose ps

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
```

### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
# Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8080

# Backend
BACKEND_PORT=8080
JWT_SECRET=your-256-bit-secret-key-here
APP_CORS_ORIGINS=http://localhost:3000

# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=neobank_user
MYSQL_PASSWORD=neobank_pass
MYSQL_PORT=3306
```

### Dockers Compose Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `frontend` | neobank-frontend:latest | 3000 | Nginx serving React SPA |
| `backend` | neobank-backend:latest | 8080 | Spring Boot REST API |
| `db` | mysql:8.0 | 3306 | MySQL database |

### Stop Services

```bash
docker compose down
# To also remove volumes (resets database):
docker compose down -v
```

---

## 3. Railway Deployment (Full Stack)

Railway provides automated deployment with MySQL plugin.

### Prerequisites

- Railway account
- GitHub repository

### Steps

1. **Push to GitHub**
2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project → Deploy from GitHub repo
3. **Add MySQL Plugin**
   - Click "New" → "Database" → "MySQL"
   - Railway automatically provides `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
4. **Backend Environment Variables**

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | Your secure random string |
| `APP_CORS_ORIGINS` | Frontend URL (from Railway) |
| `SERVER_PORT` | 8080 |
| `SPRING_PROFILES_ACTIVE` | prod |

5. **Frontend Environment Variable**

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | Backend URL (from Railway) |

6. **Set Backend Start Command**
   ```bash
   cd neobank-backend && mvn spring-boot:run
   ```

### Using `railway.json`

The project includes `neobank-backend/railway.json` with predefined settings:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd neobank-backend && mvn clean package -DskipTests"
  },
  "deploy": {
    "startCommand": "cd neobank-backend && java -jar target/*.jar",
    "healthcheckPath": "/actuator/health"
  }
}
```

---

## 4. Manual Production Deployment

### Backend (Spring Boot)

```bash
cd neobank-backend

# Build the JAR
mvn clean package -DskipTests

# Run with production config
java -jar target/neobank-1.0.0.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:mysql://your-mysql-host:3306/neobank \
  --spring.datasource.username=your_user \
  --spring.datasource.password=your_password \
  --app.jwt.secret=your-256-bit-secret \
  --app.cors.origins=https://your-frontend.com
```

### Frontend (Build & Serve)

```bash
# Build
VITE_API_BASE_URL=https://your-backend.com npm run build

# Serve with any static server
# Option 1: Nginx (recommended - see nginx.conf)
# Option 2: Vite preview
npm run preview

# Option 3: Any static server
npx serve dist -l 3000
```

### Nginx Configuration

The project includes `nginx.conf` for production serving:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. Environment Variables Reference

### Frontend (`VITE_*`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_DEMO_MODE` | No | `false` | Enable mock adapter (no backend needed) |
| `VITE_API_BASE_URL` | No | `''` | Backend API URL (for production) |

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERVER_PORT` | No | `8080` | Server port |
| `SPRING_DATASOURCE_URL` | Yes (prod) | `jdbc:mysql://localhost:3306/neobank` | MySQL connection string |
| `SPRING_DATASOURCE_USERNAME` | Yes (prod) | `root` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Yes (prod) | `Manish@258` | MySQL password |
| `JWT_SECRET` | Yes (prod) | See code | JWT signing secret (256-bit) |
| `JWT_EXPIRATION_MS` | No | `86400000` | Token expiry (24h) |
| `APP_CORS_ORIGINS` | Yes (prod) | `http://localhost:5173` | Allowed CORS origins |

---

## 6. Quick Start Script

The project includes `start.sh` for local development:

```bash
#!/bin/bash
# NeoBank simple startup — run just the frontend in demo mode
cd "$(dirname "$0")"
echo "Starting NeoBank in DEMO mode..."
VITE_DEMO_MODE=true npx vite --port 5173 --host
```

```bash
# Quick start
chmod +x start.sh
./start.sh
```

---

## 7. Verification Checklist

After deployment, verify:

- [ ] Login works with seed credentials
- [ ] Dashboard shows accounts and transactions
- [ ] Transfers complete successfully
- [ ] Both sender and receiver see updated balances
- [ ] Teller operations (create account, deposit, withdraw) work
- [ ] Admin console loads and shows data
- [ ] KYC submission and verification flow works
- [ ] Logout clears session and redirects to login
- [ ] Mobile responsive layout works
