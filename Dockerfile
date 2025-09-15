# Build for cloud: docker build --platform linux/amd64 -t orca-app .
# Build for AMD64
# docker build --platform linux/amd64 -t orca-app .
# docker build --platform linux/amd64 -t sealos-brain-frontend:v0.2 .
# docker tag sha256:119e4f8da993c856b199d970b14c83e13edbda9d1b934252a5f76e1c2b1b3d50 crpi-xgxlm7ulopyatpv5.cn-shanghai.personal.cr.aliyuncs.com/hydrangeas/sealos-brain-frontend:v0.3
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
ENV NEXT_PUBLIC_MODE=production
ENV NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL=https://kccpbrlxlwnp.sealosbja.site
ENV NEXT_PUBLIC_LANGGRAPH_GRAPH_ID=orca
# Run the Next.js app with pnpm
CMD ["pnpm", "start"]