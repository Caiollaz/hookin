# --------------------------
# STAGE 1 — BUILD
# --------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copia configs + lockfiles
COPY api/package.json api/pnpm-lock.yaml* ./

# Instala tudo (dev + prod)
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY api ./

# Build TS
RUN pnpm run build

# --------------------------
# STAGE 2 — PRODUCTION
# --------------------------
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copia apenas dependências de runtime
COPY api/package.json api/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Copia os artefatos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./src/db/migrations

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
