FROM node:20-alpine

WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Configure npm for better network handling and install dependencies
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-timeout 300000 && \
    npm install --prefer-offline --no-audit --legacy-peer-deps

# Copy frontend source code
COPY frontend/ ./

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
