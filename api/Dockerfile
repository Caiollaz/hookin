# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar arquivos de dependências (otimiza cache de layers)
COPY api/package.json pnpm-lock.yaml* ./

# Instalar dependências (apenas se package.json ou lockfile mudarem)
RUN pnpm install --frozen-lockfile

# Copiar código fonte e configurações
COPY api/src ./src
COPY api/tsconfig.json ./
COPY api/drizzle.config.ts ./
COPY api/biome.json ./

# Compilar TypeScript
RUN pnpm exec tsc --outDir dist

# Stage 2: Production
FROM node:20-alpine AS production

# Instalar pnpm para produção (necessário para scripts)
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar package.json e lockfile
COPY api/package.json pnpm-lock.yaml* ./

# Instalar apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Copiar código compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar migrations (necessárias em runtime)
COPY api/src/db/migrations ./src/db/migrations

# Variáveis de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]