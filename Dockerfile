# Imagem do frontend DEMO (Nginx na porta 80 *dentro* do container).
# Dados mockados no app — sem build-arg de API nem backend obrigatório.
# Porta no host e nome: `docker run` ou scripts `scripts/prod/deploy.sh` / `update.sh`.
#
# Exemplo:
#   docker build -t portal-vendedor-frontend-demonstracao:latest .
#   docker run -d --name demonstracao -p 8083:80 portal-vendedor-frontend-demonstracao:latest

# Stage 1: build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve com nginx (roda como root para poder escrever /run/nginx.pid)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
