# Deploy em produção (Docker) — Frontend DEMO

Guia para buildar e subir **somente o frontend** deste repositório em um servidor Linux com **Docker**. Este projeto usa **dados mockados** nos serviços; **não** é necessário backend, `VITE_API_URL` nem proxy `/api` no Nginx.

Para subir em paralelo ao front oficial (ex.: `8081` / `portal-vendedor-frontend`), use os **defaults** deste repo: porta **8083**, container **`demonstracao`**.

---

## 1. Pré-requisitos no servidor

- Linux (Ubuntu ou similar)
- **Docker** instalado e funcionando
- Este repositório clonado

Não é necessário publicar imagem em registry: o deploy usa **build local** no servidor.

---

## 2. Código no servidor

```bash
mkdir -p /opt/apps
cd /opt/apps
git clone <URL_DO_SEU_REPO_DEMO> portal-vendedor-frontend-demo
cd portal-vendedor-frontend-demo
```

---

## 3. Variáveis de ambiente (scripts)

| Variável | Default (DEMO) | Descrição |
|----------|----------------|-----------|
| `CONTAINER_NAME` | `demonstracao` | Nome do container Docker. |
| `IMAGE_NAME` | `portal-vendedor-frontend-demonstracao:latest` | Tag da imagem (`docker build -t` / `docker run`). |
| `HOST_PORT` | `8083` | Porta **no host** mapeada para **80** dentro do container. |
| `SERVER_HOST_OVERRIDE` | _(vazio)_ | Host exibido na mensagem final (ex.: IP público). |

---

## 4. Primeiro deploy

### Script (recomendado)

```bash
cd /opt/apps/portal-vendedor-frontend-demo
chmod +x scripts/prod/deploy.sh
SERVER_HOST_OVERRIDE=163.176.239.42 ./scripts/prod/deploy.sh
```

### Comandos manuais (equivalente aos defaults)

```bash
cd /opt/apps/portal-vendedor-frontend-demo

docker build -t portal-vendedor-frontend-demonstracao:latest .
docker run -d --name demonstracao -p 8083:80 portal-vendedor-frontend-demonstracao:latest
```

---

## 5. Atualizar versão

```bash
cd /opt/apps/portal-vendedor-frontend-demo
git pull
./scripts/prod/update.sh
```

---

## 6. Parar / remover (defaults)

```bash
docker stop demonstracao
docker rm demonstracao
```

---

## 7. Mesma porta/nome do front oficial (opcional)

Só se quiser substituir o container oficial no mesmo host (não recomendado em paralelo):

```bash
HOST_PORT=8081 \
  CONTAINER_NAME=portal-vendedor-frontend \
  IMAGE_NAME=portal-vendedor-frontend:latest \
  ./scripts/prod/deploy.sh
```

---

## 8. Deploy completo stack (backend + Postgres)

Se no futuro você voltar a integrar com API real, use a documentação do **backend** / compose de produção. Este documento cobre apenas o **DEMO estático + mocks**.
