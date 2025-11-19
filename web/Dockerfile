# --------------------------
# STAGE 1 — BUILD
# --------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar lockfile e package.json corretos
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY web/package.json ./package.json

RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY web/ ./

RUN pnpm run build

# --------------------------
# STAGE 2 — PRODUCTION
# --------------------------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
