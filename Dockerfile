# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

RUN yarn install

# Copy source
COPY . .

# Build Next.js
RUN yarn run build

# Stage 2: Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy build từ builder
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

CMD ["yarn", "start"]