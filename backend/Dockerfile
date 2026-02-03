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

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ============================================
# Development stage - hot reload
# ============================================
FROM base AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Development runs with mounted volumes, so source isn't copied
# Expose the dev server port
EXPOSE 3000

CMD ["npm", "run", "dev"]

# ============================================
# Build stage - compile TypeScript
# ============================================
FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies for production
RUN npm prune --production

# ============================================
# Production stage - minimal runtime
# ============================================
FROM node:22-alpine AS prod

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 barae

# Copy only what's needed for production
COPY --from=build --chown=barae:nodejs /app/dist ./dist
COPY --from=build --chown=barae:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=barae:nodejs /app/package.json ./

# Switch to non-root user
USER barae

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
