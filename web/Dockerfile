# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# Root workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Web package.json
COPY web/package.json ./web/

# Variável de ambiente usada pelo Vite no build
ENV VITE_API_URL=https://api.hookin.site

RUN pnpm install --frozen-lockfile

COPY web ./web

RUN pnpm --filter web run build


# Stage 2: Production
FROM nginx:alpine AS production

COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
