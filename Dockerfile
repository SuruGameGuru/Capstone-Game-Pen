# Stage 1: Build frontend
FROM node:18 AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18 AS backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Stage 3: Production image
FROM node:18-slim
WORKDIR /app
# Copy backend
COPY --from=backend-build /app/server ./server
# Copy frontend build
COPY --from=frontend-build /app/client/build ./client/build
# Set environment variables (override in deployment)
ENV NODE_ENV=production
# Expose backend port
EXPOSE 3001
# Start backend
CMD ["node", "server/index.js"] 