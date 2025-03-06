FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Force use of pure JS implementations
ENV ROLLUP_SKIP_NATIVE=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Create .npmrc for cross-platform builds
RUN echo "node-linker=hoisted\nignore-scripts=true\nlegacy-peer-deps=true" > .npmrc

# Install dependencies with specific flags
RUN npm install \
    --no-optional \
    --legacy-peer-deps \
    --platform=linux \
    --no-package-lock

EXPOSE 3000

# Development mode command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]