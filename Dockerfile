# Build for cloud: docker build --platform linux/amd64 -t orca-app .
# Build for AMD64
# docker build --platform linux/amd64 -t orca-app .
# docker build --platform linux/amd64 -t sealos-brain-frontend:v0.2 .
# docker tag sha256:8a9475d710b173be87e566d8bd2b1a5c1ac9c044231a3404f2342037e3d336ff puddlecat/sealos-brain-frontend:v0.11
# docker tag sha256:7d41dd40fec5db13aad90c61955a3a8074c14ede6d8cb0f1ef17348d2e4b164d crpi-xgxlm7ulopyatpv5.cn-shanghai.personal.cr.aliyuncs.com/hydrangeas/sealos-brain-frontend:v0.3
# docker push crpi-xgxlm7ulopyatpv5.cn-shanghai.personal.cr.aliyuncs.com/hydrangeas/sealos-brain-frontend:v0.3

# # Tag for your repository
# docker tag orca-app puddlecat/orca-app:latest

# # Login to Docker Hub
# docker login

# # Push to Docker Hub
# docker push puddlecat/orca-app:latest
# Stage 1: Build the Next.js app
FROM node:22-alpine AS builder
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile
# Copy the rest of the project files
COPY . .
# Build the Next.js app (skip linting for Docker build)
RUN pnpm build

# Stage 2: Run the Next.js app
FROM node:22-alpine
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/public ./public
# Expose the port Next.js runs on (default: 3000)
EXPOSE 3000
# Set environment variables
ENV NODE_ENV=production
# Run the Next.js app with pnpm
CMD ["pnpm", "start"]