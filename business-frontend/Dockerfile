# Stage 1: Build the React application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Skopiowanie całego kodu źródłowego z obecnego katalogu
COPY . .

# Build aplikacji
RUN npm run build

# Stage 2: Serve the application using Node.js
FROM node:22-alpine
WORKDIR /app

# Copy built assets and dependencies from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]