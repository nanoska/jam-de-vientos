FROM node:20-alpine

WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
