# Deploy em produção (Docker) — Frontend

Guia para buildar e subir **somente o frontend** em um servidor Linux usando **Docker** (container único). O backend e o Postgres ficam no repositório do backend; este doc é para quem sobe só o front em outro servidor ou usa o script próprio do front.

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
git clone https://github.com/Sankhya-ABC/portal-vendedor-frontend.git
cd portal-vendedor-frontend
```

---

## 3. Configurar URL do backend

A URL do backend é definida **no build** da imagem, via variável `VITE_API_URL`:

- Se o front e o back estão no mesmo servidor e você acessa por IP/porta:  
  `VITE_API_URL=http://SEU_IP_OU_DOMINIO:8082`
- Se há um proxy (ex.: Nginx) que mapeia `/api` para o backend:  
  `VITE_API_URL=/api`

Use essa variável ao rodar o script (veja abaixo).

---

## 4. Primeiro deploy

### Usando o script (recomendado)

```bash
cd /opt/apps/portal-vendedor-frontend
chmod +x scripts/prod/deploy.sh

# Exemplo: backend na porta 8082 do mesmo servidor
VITE_API_URL=http://SEU_SERVIDOR:8082 ./scripts/prod/deploy.sh

# Ou com domínio fixo na mensagem final
SERVER_HOST_OVERRIDE=app.seudominio.com.br VITE_API_URL=http://app.seudominio.com.br:8082 ./scripts/prod/deploy.sh
```

O script:

- Faz o build da imagem com o `VITE_API_URL` informado
- Para e remove o container antigo (se existir)
- Sobe o novo container na porta **8081**
- Exibe a URL do frontend (usando o hostname do servidor ou `SERVER_HOST_OVERRIDE`)

### Comandos manuais

```bash
cd /opt/apps/portal-vendedor-frontend

docker build --build-arg VITE_API_URL=http://SEU_SERVIDOR:8082 -t portal-vendedor-frontend:latest .
docker run -d --name portal-vendedor-frontend -p 8081:80 portal-vendedor-frontend:latest
```

---

## 5. Atualizar versão

Após ajustes no código, faça `git pull` e rode o script de atualização (rebuild + recriar container):

```bash
cd /opt/apps/portal-vendedor-frontend
git pull
VITE_API_URL=http://SEU_SERVIDOR:8082 ./scripts/prod/update.sh
```

O `update.sh` reconstrói a imagem e recria apenas o container do frontend. Se preferir, pode usar o mesmo comando com `deploy.sh` no lugar de `update.sh` (o efeito é o mesmo).

---

## 6. Parar / remover

```bash
docker stop portal-vendedor-frontend
docker rm portal-vendedor-frontend
```

---

## 7. Deploy completo (backend + frontend + Postgres)

Se você sobe **tudo** pelo repositório do backend (com `docker-compose.prod.yml`), o frontend é buildado junto. Use a documentação do backend:

- [Deploy em produção (backend)](https://github.com/Sankhya-ABC/sv-portal-vendedores-backend/blob/master/docs/DEPLOY-PRODUCAO.md) — clone backend e frontend lado a lado e rode o script `scripts/prod/deploy.sh` do **backend**.

Este doc é para o caso em que você sobe **apenas o frontend** (por exemplo em outro servidor ou sem o compose do backend).
