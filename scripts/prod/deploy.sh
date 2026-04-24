#!/usr/bin/env bash
set -e

# Script de conveniência para buildar e subir SOMENTE o frontend DEMO
# em produção, usando o Dockerfile deste repositório (dados mockados; sem backend).
#
# Pré‑requisitos no servidor:
# - git, docker instalados
# - este repositório clonado
#
# Variáveis:
# - CONTAINER_NAME (default: demonstracao)
# - IMAGE_NAME (default: portal-vendedor-frontend-demonstracao:latest)
# - HOST_PORT (default: 8083)
# - SERVER_HOST_OVERRIDE — host exibido na mensagem final (opcional)
#
# Uso típico:
#   chmod +x scripts/prod/deploy.sh
#   ./scripts/prod/deploy.sh
#
# Alinhar com o front oficial (8081 / portal-vendedor-frontend), se necessário:
#   HOST_PORT=8081 CONTAINER_NAME=portal-vendedor-frontend IMAGE_NAME=portal-vendedor-frontend:latest ./scripts/prod/deploy.sh

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
echo "==> Buildando imagem..."

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
echo "Frontend disponível em: http://$SERVER_HOST:$HOST_PORT"
