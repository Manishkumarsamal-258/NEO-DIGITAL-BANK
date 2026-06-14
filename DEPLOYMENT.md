# NeoBank — Deployment Guide

## Prerequisites

- **Node.js** 18+ and **npm** (for local builds)
- A **backend API server** running (Spring Boot) that the frontend connects to
- API keys / environment variables ready for your target environment

---

## Quick Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. The `vercel.json` in the root handles SPA routing automatically
3. **Set environment variable** in Vercel Dashboard:
   - `VITE_API_BASE_URL` — your deployed backend URL (e.g. `https://api.your-domain.com`)
4. Deploy — done!

Vercel auto-detects the Vite framework and uses the `vercel.json` rewrites for SPA fallback.

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

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes (prod) | Backend API server URL | `https://api.your-domain.com` |

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
3. Check CORS configuration on the backend to allow your frontend domain

### Build failing
1. Run `npm run build` locally first to verify
2. Check Node.js version (use 18+)
3. Clear npm cache: `npm cache clean --force`
