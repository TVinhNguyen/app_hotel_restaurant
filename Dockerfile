# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Development stage
FROM node:24-alpine

WORKDIR /app

# Install required system packages for Expo CLI
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy application code
COPY . .

# Expose Expo default port
EXPOSE 8081 19000 19001 19002

# Set npm to use legacy peer deps
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Default command
CMD ["npm", "start"]
