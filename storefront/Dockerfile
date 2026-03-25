# ZotoShop Storefront — Dockerfile
FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN corepack enable && yarn install

# Copier le code source
COPY . .

# Exposer le port storefront
EXPOSE 8000

# Lancer en mode dev (pas de build SSG nécessaire)
CMD ["yarn", "dev", "-p", "8000"]
