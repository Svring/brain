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
# Build the Next.js app
RUN pnpm run build

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