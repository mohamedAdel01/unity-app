# ====================================================
# Stage 1: Build & Generate Static Nuxt Web Application
# ====================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm package manager
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
COPY shared/package.json ./shared/
COPY apps/web/package.json ./apps/web/

# Install monorepo dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy shared code & web application code
COPY shared/ ./shared/
COPY apps/web/ ./apps/web/

# Generate static web build
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm --filter @unity/web generate

# ====================================================
# Stage 2: Production High-Performance Nginx Web Server
# ====================================================
FROM nginx:alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-generated static web assets from builder
COPY --from=builder /app/apps/web/.output/public /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
