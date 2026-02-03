# ============================================
# Base stage - shared foundation
# ============================================
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# Development stage
# ============================================
FROM base AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# ============================================
# Build stage
# ============================================
FROM base AS build

WORKDIR /app

ARG VITE_API_URL=/api

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================
# Production stage - nginx with static files
# Serves frontend and proxies /api to backend
# ============================================
FROM nginx:alpine AS prod

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
