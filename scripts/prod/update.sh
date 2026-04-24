#!/usr/bin/env bash
set -e

# Atualiza o container do frontend após você dar git pull.
# Rebuilda a imagem e recria o container (não mexe em banco nem em outros serviços).
#
# Uso:
#   cd /opt/apps/portal-vendedor-frontend
#   git pull
#   VITE_API_URL=http://SEU_SERVIDOR:8082 ./scripts/prod/update.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Diretório raiz do frontend: $ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERRO: docker não encontrado no PATH."
  exit 1
fi

VITE_API_URL_VALUE="${VITE_API_URL:-/api}"
echo "==> Rebuild da imagem com VITE_API_URL=$VITE_API_URL_VALUE ..."

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
SERVER_HOST="${SERVER_HOST_OVERRIDE:-$(hostname -f 2>/dev/null || hostname || echo "SEU_SERVIDOR")}"
echo "Frontend atualizado e disponível em: http://$SERVER_HOST:8081"
