#!/usr/bin/env bash
set -e

# Atualiza o container do frontend DEMO após git pull (rebuild + recriar container).
#
# Variáveis (mesmas do deploy.sh):
# - CONTAINER_NAME, IMAGE_NAME, HOST_PORT, SERVER_HOST_OVERRIDE
#
# Uso:
#   cd /opt/apps/portal-vendedor-frontend-demo
#   git pull
#   ./scripts/prod/update.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Diretório raiz do frontend: $ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERRO: docker não encontrado no PATH."
  exit 1
fi

CONTAINER_NAME="${CONTAINER_NAME:-demonstracao}"
IMAGE_NAME="${IMAGE_NAME:-portal-vendedor-frontend-demonstracao:latest}"
HOST_PORT="${HOST_PORT:-8083}"

echo "==> Parâmetros: CONTAINER_NAME=$CONTAINER_NAME IMAGE_NAME=$IMAGE_NAME HOST_PORT=$HOST_PORT"
echo "==> Rebuild da imagem..."

docker build -t "$IMAGE_NAME" .

echo "==> Parando e removendo container antigo (se existir): $CONTAINER_NAME ..."
if docker ps -a --format '{{.Names}}' | grep -qxF "$CONTAINER_NAME"; then
  docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

echo "==> Subindo novo container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${HOST_PORT}:80" \
  "$IMAGE_NAME"

echo
SERVER_HOST="${SERVER_HOST_OVERRIDE:-$(hostname -f 2>/dev/null || hostname || echo "SEU_SERVIDOR")}"
echo "Frontend atualizado e disponível em: http://$SERVER_HOST:$HOST_PORT"
