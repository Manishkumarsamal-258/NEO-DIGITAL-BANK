# NeoBank — Deployment Guide

## Prerequisites

- **Node.js** 18+ and **npm** (for local builds)
- A **backend API server** running (Spring Boot) that the frontend connects to
- API keys / environment variables ready for your target environment

---

## Quick Deploy (Frontend on Vercel + Backend on Railway)

This is the recommended free setup: frontend on Vercel, backend + MySQL on Railway.

### Step 1: Deploy Backend on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. **Create a Railway account** at [railway.app](https://railway.app) (free tier requires no credit card)
2. **Create a new project** → **Deploy from GitHub repo** → Connect your NeoBank repository
3. **Add a MySQL database:**
   - Click **New** → **Database** → **Add MySQL**
   - Wait for it to provision (takes ~30 seconds)
   - Railway auto-injects `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` into your backend service
4. **Add the backend service:**
   - Click **New** → **GitHub Repo** → Select your repo → Set root directory to `neobank-backend`
   - Railway will auto-detect the `Dockerfile` and build the Spring Boot app
   - **Set environment variables** in the backend service:
     - `JWT_SECRET` — generate a secure random string (e.g. `openssl rand -hex 64`)
     - `APP_CORS_ORIGINS` — set to `https://your-app.vercel.app` (your Vercel frontend URL)

   > ⚠️ **Railway MySQL env var names**:
   > Railway's MySQL plugin provides connection details as `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`.
   > Spring Boot expects `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
   > You must **manually map** these in Railway's dashboard:
   > - `SPRING_DATASOURCE_URL` → paste the value from Railway's `MYSQL_URL`
   > - `SPRING_DATASOURCE_USERNAME` → paste the value from `MYSQL_USER`
   > - `SPRING_DATASOURCE_PASSWORD` → paste the value from `MYSQL_PASSWORD`
   >
   > You can find these values in Railway Dashboard → MySQL plugin → **Variables** tab.

5. Once deployed, Railway gives your backend a URL like `https://neobank-backend.up.railway.app`

### Step 2: Deploy Frontend on Vercel

1. **Push the Railway backend URL** as a Vercel environment variable:
   - Go to your Vercel project → **Settings** → **Environment Variables**
   - Add: `VITE_API_BASE_URL` = `https://neobank-backend.up.railway.app`
   - **Redeploy** the frontend on Vercel
2. Your frontend will now make API calls to the Railway backend instead of `/api`

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
