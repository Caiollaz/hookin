# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar root config (workspace + lockfile)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# Copiar API package.json
COPY api/package.json ./api/

RUN pnpm install --frozen-lockfile

# Copiar código
COPY api ./api

RUN pnpm --filter api run build


# Stage 2: Production
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar root config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY api/package.json ./api/

RUN pnpm install --frozen-lockfile --prod --filter api

COPY --from=builder /app/api/dist ./dist

CMD ["node", "dist/server.js"]
