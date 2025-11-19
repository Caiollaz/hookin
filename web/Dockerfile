# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar arquivos de dependências (otimiza cache de layers)
COPY web/package.json ./
COPY web/pnpm-lock.yaml ./pnpm-lock.yaml

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

# Expor porta
EXPOSE 80

# Comando padrão do nginx já está configurado
CMD ["nginx", "-g", "daemon off;"]
