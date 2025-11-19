# ---------- BUILDER ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas arquivos que congelam dependências
COPY api/package.json api/package-lock.json ./

# Instalar dependências completas
RUN npm install

# Copiar todo o código da API
COPY api/ ./

# Compilar TypeScript
RUN npm run build


# ---------- PRODUCTION ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas dependências para produção
COPY api/package.json api/package-lock.json ./
RUN npm install --only=production

# Copiar build final
COPY --from=builder /app/dist ./dist

# Start
CMD ["node", "dist/server.js"]
