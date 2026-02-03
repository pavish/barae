# ============================================
# Base stage - shared foundation
# ============================================
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies needed for node-gyp (some packages may need it)
RUN apk add --no-cache libc6-compat

# ============================================
# Dependencies stage - install all deps
# ============================================
FROM base AS deps

COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# ============================================
# Development stage - Vite dev server
# ============================================
FROM base AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Development runs with mounted volumes, so source isn't copied
# Vite dev server port
EXPOSE 5173

# --host exposes to all interfaces (needed for Docker)
CMD ["npm", "run", "dev", "--", "--host"]

# ============================================
# Build stage - compile and bundle
# ============================================
FROM base AS build

WORKDIR /app

# Build args for environment variables at build time
ARG VITE_API_URL=/api

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# ============================================
# Production stage - static files only
# Output can be copied to nginx or served standalone
# ============================================
FROM nginx:alpine AS prod

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx runs on port 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
