# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar configs do monorepo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copiar todos os package.json do workspace
COPY api/package.json ./api/
COPY web/package.json ./web/

# Instalar todas as dependências (dev + runtime)
RUN pnpm install --frozen-lockfile

# Copiar código
COPY api ./api

# Buildar a API
RUN pnpm --filter api build


# Stage 2: Production
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar root config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copiar todos os package.json do workspace
COPY api/package.json ./api/
COPY web/package.json ./web/

# Instalar apenas deps de produção do monorepo inteiro
RUN pnpm install --prod --frozen-lockfile

# Copiar dist apenas da API
COPY --from=builder /app/api/dist ./api/dist

CMD ["node", "api/dist/server.js"]
