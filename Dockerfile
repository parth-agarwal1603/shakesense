# Multi-stage Dockerfile for ShakeSense Motor Health Dashboard
# Optimized for Render Web Services & Local Docker Containers

# -----------------------------------------------------------------------------
# Stage 1: Build the production application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application source code and configs
COPY . .

# Run TypeScript verification and generate Vite production bundle
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production runtime environment
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Copy package files and install dependencies needed to run vite preview
COPY package*.json ./
RUN npm install --omit=dev && npm install vite

# Copy built artifacts and Vite configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/index.html ./

# Expose Render default port (10000) and fallback port (3000)
EXPOSE 10000 3000

# Start production server with host and port bound to Render's $PORT
CMD ["sh", "-c", "npx vite preview --host 0.0.0.0 --port ${PORT:-10000}"]
