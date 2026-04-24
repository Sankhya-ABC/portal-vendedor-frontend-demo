#!/usr/bin/env bash
set -e

# Script de conveniência para buildar e subir SOMENTE o frontend
# em produção, usando o Dockerfile deste repositório.
#
# Pré‑requisitos no servidor:
# - git, docker instalados
# - este repositório clonado
#
# Variáveis importantes:
# - VITE_API_URL: URL do backend vista pelo navegador (ex: http://SEU_SERVIDOR:8082 ou /api)
#
# Uso típico:
#   chmod +x scripts/prod/deploy.sh
#   VITE_API_URL=http://SEU_SERVIDOR:8082 ./scripts/prod/deploy.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Diretório raiz do frontend: $ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERRO: docker não encontrado no PATH."
  exit 1
fi

VITE_API_URL_VALUE="${VITE_API_URL:-/api}"
echo "==> Buildando imagem do frontend com VITE_API_URL=$VITE_API_URL_VALUE ..."

docker build \
  --build-arg VITE_API_URL="$VITE_API_URL_VALUE" \
  -t portal-vendedor-frontend:latest .

echo "==> Parando e removendo container antigo (se existir)..."
if docker ps -a --format '{{.Names}}' | grep -q '^portal-vendedor-frontend$'; then
  docker stop portal-vendedor-frontend >/dev/null 2>&1 || true
  docker rm portal-vendedor-frontend >/dev/null 2>&1 || true
fi

echo "==> Subindo novo container do frontend..."
docker run -d \
  --name portal-vendedor-frontend \
  -p 8081:80 \
  portal-vendedor-frontend:latest

echo
# Melhor tentativa de descobrir o host (pode ser sobrescrito via SERVER_HOST_OVERRIDE)
SERVER_HOST="${SERVER_HOST_OVERRIDE:-$(hostname -f 2>/dev/null || hostname || echo "SEU_SERVIDOR")}"
echo "Frontend disponível em: http://$SERVER_HOST:8081"

