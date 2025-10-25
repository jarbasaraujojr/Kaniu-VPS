# Official multi-stage Dockerfile for Next.js frontend (avoids running arbitrary build.sh)

# Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for building (git needed by some packages)
RUN apk add --no-cache git

# Copy package manifests and install
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy the rest of the frontend code
COPY frontend .

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts and production deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/styles ./styles

EXPOSE 3000

# Use JSON array form for CMD to follow best practices
CMD ["npm","start"]
