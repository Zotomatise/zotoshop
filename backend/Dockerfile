# ZotoShop Backend — Dockerfile
FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN corepack enable && yarn install

# Copier le code source
COPY . .

# Build Medusa
RUN npx medusa build

# Exposer le port API
EXPOSE 9000

# Script de démarrage : migrate → seed → start (séquentiel)
CMD ["sh", "-c", "npx medusa db:migrate && (npx medusa exec ./src/scripts/seed.ts || true) && npx medusa start"]
