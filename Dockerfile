# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (skip TypeScript checks)
RUN npm run build:docker

# Production stage
FROM nginx:alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"] 