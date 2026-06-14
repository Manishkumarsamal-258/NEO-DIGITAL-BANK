# ── NeoBank Dockerfile ─────────────────────────────────────
# Multi-stage build: install → build → serve with Nginx

# ═══ Stage 1: Install & Build ═══
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --no-audit --no-fund

# Copy source files
COPY . .

# Build for production
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ═══ Stage 2: Production Server (Nginx) ═══
FROM nginx:stable-alpine AS runner

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: run as non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
