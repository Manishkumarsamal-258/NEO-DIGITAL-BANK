# NeoBank — Deployment Guide

## Prerequisites

- **Node.js** 18+ and **npm** (for local builds)
- A **backend API server** running (Spring Boot) that the frontend connects to
- API keys / environment variables ready for your target environment

---

## 🚀 Quickest Option: Vercel Only (Demo Mode — No Backend Needed)

**No backend, no database, no credit card required.** Set `VITE_DEMO_MODE=true` and your app works entirely in the browser using localStorage mock data.

### How it works

1. **In your Vercel project** → **Settings** → **Environment Variables** → Add:
   - `VITE_DEMO_MODE` = `true`
2. **Redeploy** your frontend on Vercel
3. ✅ **Done!** The app now works fully without any backend.

### Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Customer | `alice@neobank.com` | `password123` |
| Customer | `bob@neobank.com` | `password123` |
| Teller | `teller@neobank.com` | `teller123` |
| Admin | `admin@neobank.com` | `admin123` |

### What works in demo mode

- ✅ Login / Register / Profile management
- ✅ View accounts, balances, transactions
- ✅ Transfer money between accounts
- ✅ Deposit / Withdraw
- ✅ Beneficiary management (add, edit, delete)
- ✅ KYC document upload
- ✅ Admin panel (users, accounts, KYC verification)
- ✅ Teller operations (customer management, account creation)
- ✅ All data persists in browser localStorage

> ⚠️ **Data is stored in your browser's localStorage.** Clearing browser data will reset everything to the defaults. All data is local to each device.

---

## Full Stack: Frontend on Vercel + Backend on Render + TiDB Cloud MySQL

For a production-ready setup with a real backend and database:

### Step 1: Create Free MySQL Database (TiDB Cloud)

[![TiDB Cloud Free Tier](https://img.shields.io/badge/TiDB_Cloud-Free_tier-blue)](https://tidbcloud.com/signup)

1. **Sign up** at [tidbcloud.com](https://tidbcloud.com/signup) — no credit card required
2. **Create a Serverless Tier cluster:**
   - Click **Create Cluster** → Select **Serverless Tier** (free)
   - Choose any region close to you
   - Click **Create** (takes ~30-60 seconds to provision)
3. **Get connection details:**
   - Click **Connect** on your cluster
   - Select **General** tab → copy the connection string
   - Save these values:
     - `Host` (looks like `gateway01.us-east-xxx.prod.aws.tidbcloud.com`)
     - `Port` (usually `4000`)
     - `Username` (looks like `xxxxx.root`)
     - `Password`
     - `Database` (default: `test`, you can create a new one)
4. Your JDBC URL will be:
   ```
   jdbc:mysql://<HOST>:4000/<DB>?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
   ```

> 💡 **TiDB Cloud Networking:** If you encounter connection issues, go to **TiDB Cloud Console → your cluster → Networking** and ensure **"Allow Access from Anywhere"** is enabled.

---

### Step 2: Deploy Backend on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. **Sign up** at [render.com](https://render.com) — no credit card required
2. **Create a new Web Service:**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Choose the `neobank-backend` directory (or select the whole repo and set **Root Directory** to `neobank-backend`)
   - **Runtime:** Select **Docker** (Render auto-detects the `Dockerfile`)
   - **Name:** `neobank-backend`
3. **Set environment variables:**

   | Variable | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | JDBC URL from TiDB Cloud |
   | `SPRING_DATASOURCE_USERNAME` | Your TiDB Cloud username |
   | `SPRING_DATASOURCE_PASSWORD` | Your TiDB Cloud password |
   | `JWT_SECRET` | Run `openssl rand -hex 64` to generate |
   | `APP_CORS_ORIGINS` | `https://your-app.vercel.app` |

4. **Deploy:** Click **Create Web Service** (builds via Docker, takes ~5-10 min)

> ⚠️ **Note:** Render's free tier web services **sleep after 15 minutes of inactivity**. They auto-wake on the next request (~30s cold start).

---

### Step 3: Connect Frontend on Vercel

1. Go to your **Vercel project** → **Settings** → **Environment Variables**
2. Add:
   - `VITE_API_BASE_URL` = `https://neobank-backend.onrender.com`
   - Remove `VITE_DEMO_MODE` (or set to `false`)
3. **Redeploy** on Vercel

---

## Vercel (Frontend Only)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. The `vercel.json` in the root handles SPA routing automatically
3. **Set environment variable** in Vercel Dashboard:
   - `VITE_API_BASE_URL` — your deployed backend URL (e.g. `https://neobank-backend.up.railway.app`)
4. Deploy — done!

> ⚠️ **Without setting `VITE_API_BASE_URL`, API calls go to `/api` on Vercel's domain, which won't work unless you have a backend there.**

---

## Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. **Set environment variable** in Netlify Dashboard → Build & Deploy → Environment:
   - `VITE_API_BASE_URL` — your deployed backend URL
5. Deploy — the `netlify.toml` and `public/_redirects` handle SPA routing

---

## Docker (Single Server)

Build and run the frontend with Nginx:

```bash
# Build the image
docker build -t neobank-frontend .

# Run (standalone — connect to external API)
docker run -d -p 3000:80 \
  -e VITE_API_BASE_URL=https://api.your-domain.com \
  neobank-frontend
```

---

## Docker Compose (Full Stack)

Start frontend + backend + MySQL together:

```bash
# Set your env vars (or use defaults for local dev)
export MYSQL_ROOT_PASSWORD=yourpassword
export JWT_SECRET=your-secret-key

# Start all services
docker compose up -d --build

# Access at http://localhost:3000
```

Stop: `docker compose down`

---

## AWS S3 + CloudFront

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   - Create an S3 bucket enabled for static website hosting
   - Upload the `dist/` folder contents
   - **Set Error Document** to `index.html` (this enables SPA routing)
   - Set bucket policy for public read access, or use CloudFront OAI

3. **CloudFront (recommended):**
   - Create a CloudFront distribution pointing to your S3 bucket
   - **Error Pages** → Create custom error response:
     - HTTP error code: `403` or `404`
     - Customize error response: **Yes**
     - Response page path: `/index.html`
     - HTTP response code: `200`
   - Add environment variables using a Lambda@Edge function or CloudFront Functions to inject `VITE_API_BASE_URL` into the HTML

4. **Alternative (no CloudFront):** Set bucket for static hosting and configure the Error Document to `index.html`.

---

## Azure Static Web Apps

1. Create a Static Web App resource in Azure Portal
2. Connect your GitHub repository
3. Build preset: **Vite**
4. App location: `/`
5. Output location: `dist`
6. **Set environment variable** in Azure Portal → Configuration → Application settings:
   - `VITE_API_BASE_URL` — your deployed backend URL
7. Azure Static Web Apps handles SPA routing automatically

---

## Heroku

```bash
# Requires Heroku static buildpack
heroku create neobank-frontend --buildpack heroku-community/static
heroku git:remote -a neobank-frontend

# Set API URL
heroku config:set VITE_API_BASE_URL=https://api.your-domain.com

# Deploy
git push heroku main
```

The `static.json` file handles SPA routing and HTTPS.

---

## Environment Variables

### Frontend (Vite)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes (prod) | Backend API server URL | `https://neobank-backend.up.railway.app` |

### Backend (Spring Boot)

| Variable | Required | Description | Example |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | Yes | MySQL JDBC URL | `jdbc:mysql://...` |
| `SPRING_DATASOURCE_USERNAME` | Yes | MySQL username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Yes | MySQL password | |
| `JWT_SECRET` | Yes | JWT signing secret (256-bit) | `openssl rand -hex 64` |
| `APP_CORS_ORIGINS` | Yes | Comma-separated allowed CORS origins | `https://neobank.vercel.app` |
| `SERVER_PORT` | No | Server port (default: 8080) | `8080` |

> **Note:** In development, `VITE_API_BASE_URL` is optional — the Vite dev server proxies `/api` → `localhost:8080`.

---

## Troubleshooting

### SPA Routing (Blank page on route refresh)
✓ **Vercel:** Handled by `vercel.json` rewrites
✓ **Netlify:** Handled by `netlify.toml` + `public/_redirects`
✓ **Docker/Nginx:** Handled by `nginx.conf` `try_files`
✓ **AWS S3:** Set error document to `index.html`
✓ **AWS CloudFront:** Add custom error response for 403/404 → `/index.html` (200)
✓ **Heroku:** Handled by `static.json` `error_page`

### API calls failing
1. Ensure `VITE_API_BASE_URL` is set correctly in your hosting platform
2. Verify the backend server is running and accessible
3. Check CORS configuration on the backend to allow your frontend domain (set `APP_CORS_ORIGINS`)

### Build failing
1. Run `npm run build` locally first to verify
2. Check Node.js version (use 18+)
3. Clear npm cache: `npm cache clean --force`
