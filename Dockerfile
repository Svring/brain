# Build for cloud: docker build --platform linux/amd64 -t orca-app .
# Build for AMD64
# docker build --platform linux/amd64 -t orca-app .
# docker build --platform linux/amd64 -t sealos-brain-frontend:v0.2 .
# docker tag sha256:7b27b657d08a04eb9f23389ad37b2f9645691fcf6b4b8e4fc292a7f88dbd7d60 puddlecat/sealos-brain-frontend:v0.16.2
# docker tag sha256:7d41dd40fec5db13aad90c61955a3a8074c14ede6d8cb0f1ef17348d2e4b164d crpi-xgxlm7ulopyatpv5.cn-shanghai.personal.cr.aliyuncs.com/hydrangeas/sealos-brain-frontend:v0.3
# docker push crpi-xgxlm7ulopyatpv5.cn-shanghai.personal.cr.aliyuncs.com/hydrangeas/sealos-brain-frontend:v0.3

# # Tag for your repository
# docker tag orca-app puddlecat/orca-app:latest

# # Login to Docker Hub
# docker login

# # Push to Docker Hub
# docker push puddlecat/orca-app:latest
# Stage 1: Build the Next.js app
FROM node:22-slim AS builder
WORKDIR /app

# pnpm version comes from package.json "packageManager" (Corepack)
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm (using cache mount for faster rebuilds)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the Next.js app (standalone output is enabled in next.config.ts)
RUN pnpm build

# Stage 2: Run the Next.js app (standalone mode)
FROM node:22-alpine
WORKDIR /app

# Copy standalone output from builder
# This includes only the minimal runtime dependencies needed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on (default: 3000)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run the Next.js app using the standalone server
CMD ["node", "server.js"]