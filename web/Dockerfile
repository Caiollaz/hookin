# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Copiar arquivos de dependências (otimiza cache de layers)
COPY web/package.json pnpm-lock.yaml* ./

# Instalar dependências (apenas se package.json ou lockfile mudarem)
RUN pnpm install --frozen-lockfile

# Copiar código fonte (excluindo node_modules)
COPY web/src ./src
COPY web/index.html ./
COPY web/vite.config.ts ./
COPY web/tsconfig*.json ./
COPY web/biome.json ./

# Build da aplicação
RUN pnpm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck para monitoramento
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expor porta
EXPOSE 80

# Comando padrão do nginx já está configurado
CMD ["nginx", "-g", "daemon off;"]
