# ---------- BUILDER ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos essenciais do projeto
COPY web/package.json web/package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar todo o restante do código do front-end
COPY web/ ./

# Build de produção
RUN npm run build


# ---------- PRODUCTION (NGINX) ----------
FROM nginx:alpine AS production

# Copiar build final
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
