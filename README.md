# api-cifras

API REST para gerenciamento de cifras musicais, desenvolvida com Node.js, TypeScript e PostgreSQL. Projeto acadêmico com foco em boas práticas de backend e DevOps — containerização com Docker, entrega contínua com GitHub Actions e infraestrutura na AWS com Terraform.

---

## Sumário

1. [Descrição do Projeto](#1-descrição-do-projeto)
2. [Objetivos](#2-objetivos)
3. [Arquitetura MVC](#3-arquitetura-mvc)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Configuração do Ambiente](#5-configuração-do-ambiente)
6. [Variáveis de Ambiente](#6-variáveis-de-ambiente)
7. [Banco de Dados](#7-banco-de-dados)
8. [Execução Local](#8-execução-local)
9. [Endpoints da API](#9-endpoints-da-api)
10. [Execução dos Testes](#10-execução-dos-testes)
11. [Docker](#11-docker)
12. [Pipeline CI/CD](#12-pipeline-cicd)
13. [Infraestrutura Terraform](#13-infraestrutura-terraform)
14. [Secrets do GitHub Actions](#14-secrets-do-github-actions)
15. [Fluxo CI/CD Completo](#15-fluxo-cicd-completo)
16. [Possíveis Melhorias Futuras](#16-possíveis-melhorias-futuras)

---

## 1. Descrição do Projeto

O **api-cifras** expõe uma API REST que permite criar, listar, atualizar e remover músicas com suas respectivas cifras. Cada música contém título, artista, tonalidade e a cifra da música.

O projeto foi construído sem ORM — o acesso ao banco de dados é feito com **SQL puro** via biblioteca [`pg`](https://node-postgres.com/). Essa escolha é intencional: o foco da disciplina é **DevOps, Integração Contínua e Infraestrutura como Código**, e não ferramentas de persistência avançadas.

---

## 2. Objetivos

- Implementar uma API REST seguindo a arquitetura MVC com separação clara de responsabilidades.
- Aplicar boas práticas de TypeScript (tipagem estrita, sem `any`).
- Garantir qualidade com testes automatizados (Jest + Supertest).
- Containerizar a aplicação com Docker para ambiente reproduzível.
- Automatizar CI e CD com GitHub Actions (lint → test → build → push de imagem → deploy).
- Provisionar infraestrutura na AWS com Terraform (Infraestrutura como Código).

---

## 3. Arquitetura MVC

```
Request → Route → Middleware (validação) → Controller → Service → Repository → PostgreSQL
                                                ↓
                                         Response (JSON)
```

| Camada | Responsabilidade |
|---|---|
| **Route** | Mapeia URLs e verbos HTTP para controllers; aplica middlewares de validação |
| **Middleware** | Valida payloads de entrada e trata erros globais |
| **Controller** | Recebe a requisição HTTP, extrai parâmetros/body, chama o service e devolve a resposta |
| **Service** | Contém as regras de negócio; decide o que fazer com os dados |
| **Repository** | Único ponto de contato com o banco de dados; executa queries SQL |
| **Model** | Define os tipos TypeScript da entidade e converte linhas do banco em objetos tipados |

---

## 4. Estrutura de Pastas

```
api-cifras/
├── src/
│   ├── controllers/
│   │   └── song.controller.ts
│   ├── services/
│   │   └── song.service.ts
│   ├── repositories/
│   │   └── song.repository.ts
│   ├── models/
│   │   └── song.model.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── song.routes.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── validateRequest.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── init.sql
│   ├── types/
│   │   └── song.ts
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   └── songs.test.ts
│
├── scripts/
│   └── deploy.sh              # Script de deploy via Docker Compose
│
├── terraform/
│   ├── provider.tf            # Configuração do provider AWS
│   ├── variables.tf           # Variáveis parametrizadas
│   ├── main.tf                # VPC, Subnet, IGW, Route Table, SG, EC2 (com Docker)
│   └── outputs.tf             # IP/DNS da instância e URL da aplicação
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI: lint → test → build (executa em Pull Requests)
│       └── cd.yml             # CI/CD: build-and-test → build-and-push → deploy (executa em push para main)
│
├── Dockerfile                 # Imagem de produção da aplicação
├── docker-compose.yml         # Orquestração do container da aplicação
├── .dockerignore
├── jest.config.ts
├── tsconfig.json
├── tsconfig.test.json
├── .eslintrc.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Configuração do Ambiente

### Pré-requisitos

- Node.js >= 20 e Yarn (para execução local sem Docker)
- Docker e Docker Compose (para execução em container)
- PostgreSQL >= 14 (ou via container)
- Terraform >= 1.5.0 (para provisionamento de infraestrutura)
- AWS CLI (para criação do key pair SSH)

### Instalação

```bash
git clone https://github.com/<seu-usuario>/api-cifras.git
cd api-cifras

# Copie e preencha o arquivo de variáveis de ambiente
cp .env.example .env
```

Para execução local sem Docker, instale as dependências:

```bash
yarn install
```

---

## 6. Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NODE_ENV` | Ambiente (`development`, `test`, `production`) | `development` |
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | — |
| `DB_NAME` | Nome do banco de dados | `api_cifras` |
| `DOCKER_USERNAME` | Usuário do Docker Hub (usado pelo docker-compose) | — |

---

## 7. Banco de Dados

O projeto usa a biblioteca `pg` diretamente, sem ORM. As queries ficam explícitas e auditáveis.

### Criação do banco

```bash
psql -U postgres -f src/config/init.sql
```

O script `init.sql`:
1. Cria o banco `api_cifras`
2. Cria a tabela `songs` com todos os campos necessários
3. Adiciona um índice de busca por artista
4. Insere dados de exemplo

### Schema da tabela `songs`

```sql
CREATE TABLE songs (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  artist     VARCHAR(255) NOT NULL,
  key        VARCHAR(50)  NOT NULL,
  chords     TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

## 8. Execução Local

### Sem Docker

```bash
yarn dev       # Modo desenvolvimento (hot-reload)
yarn build     # Build de produção
yarn start     # Executar build compilado
```

### Com Docker

```bash
# Defina DOCKER_USERNAME no .env antes de subir
docker compose up -d

# Verificar logs
docker compose logs -f

# Parar
docker compose down
```

A API estará disponível em `http://localhost:3000`.

Verificação de saúde:
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

---

## 9. Endpoints da API

Base URL: `http://localhost:3000/api`

### Entidade Song

```json
{
  "id": 1,
  "title": "Música Teste 01",
  "artist": "Artista Teste 01",
  "key": "C",
  "chords": "C C/G Am D",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/songs` | Lista todas as músicas |
| `GET` | `/api/songs/:id` | Retorna uma música pelo ID |
| `POST` | `/api/songs` | Cria uma nova música |
| `PUT` | `/api/songs/:id` | Atualiza uma música pelo ID |
| `DELETE` | `/api/songs/:id` | Remove uma música pelo ID |

### Exemplos

```bash
# Listar todas as músicas
curl http://localhost:3000/api/songs

# Buscar por ID
curl http://localhost:3000/api/songs/1

# Criar música
curl -X POST http://localhost:3000/api/songs \
  -H "Content-Type: application/json" \
  -d '{"title":"Música Teste 01","artist":"Artista Teste 01","key":"C","chords":"C C/G Am D"}'

# Atualizar música
curl -X PUT http://localhost:3000/api/songs/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Música Teste 01 (Acústico)"}'

# Deletar música
curl -X DELETE http://localhost:3000/api/songs/1
```

---

## 10. Execução dos Testes

Os testes usam **Supertest** para fazer requisições HTTP reais contra a aplicação Express, e **Jest mocks** para isolar o banco de dados — o CI executa sem precisar de PostgreSQL em execução.

```bash
yarn test             # Executar todos os testes
yarn test:coverage    # Com relatório de cobertura
```

### Cobertura dos testes

| Suite | Casos testados |
|---|---|
| `GET /api/songs` | Lista com itens, lista vazia |
| `GET /api/songs/:id` | Encontrado, não encontrado, ID inválido |
| `POST /api/songs` | Criação com sucesso, campos obrigatórios ausentes |
| `PUT /api/songs/:id` | Atualização com sucesso, não encontrado, body vazio, ID inválido |
| `DELETE /api/songs/:id` | Deleção com sucesso, não encontrado, ID inválido |
| `GET /health` | Status 200 |

---

## 11. Docker

### Dockerfile

A imagem é construída a partir do `node:20-alpine`, instala as dependências com `--frozen-lockfile`, compila o TypeScript e executa o servidor via `node dist/server.js`.

```bash
# Build manual da imagem
docker build -t api-cifras .

# Executar container manualmente
docker run -p 3000:3000 --env-file .env api-cifras
```

### docker-compose.yml

O Compose usa a imagem publicada no Docker Hub (definida pela variável `DOCKER_USERNAME`), expõe a porta 3000, lê o `.env` e reinicia automaticamente o container em caso de falha.

Um healthcheck verifica a cada 30 segundos se o endpoint `/health` está respondendo.

### Script de deploy

O arquivo `scripts/deploy.sh` automatiza o ciclo de atualização do container na EC2:

```bash
# Para uso manual na EC2 (DOCKER_USERNAME deve estar no ambiente ou .env)
bash scripts/deploy.sh
```

O script executa: `docker compose down` → `docker pull` da imagem mais recente → `docker compose up -d`.

---

## 12. Pipeline CI/CD

O projeto usa dois workflows no GitHub Actions com responsabilidades distintas:

### `ci.yml` — Integração Contínua (Pull Requests)

Disparado em todo Pull Request para `main`. Garante que o código não quebra antes de ser mesclado.

```
Pull Request para main
        │
        ▼
   Checkout
        │
        ▼
 Setup Node.js 20
        │
        ▼
yarn install --frozen-lockfile
        │
        ▼
  yarn lint      ← ESLint + TypeScript
        │
        ▼
  yarn test      ← Jest + Supertest (sem banco)
        │
        ▼
  yarn build     ← Compilação TypeScript
```

### `cd.yml` — Pipeline CI/CD Completo (Push para main)

Disparado em todo push para `main` (após PR aprovado e mesclado). Possui três jobs encadeados — cada um só executa se o anterior passar:

```
Push para main
        │
        ▼
┌──────────────────┐
│  build-and-test  │  lint → test → build
└────────┬─────────┘
         │ (passou)
         ▼
┌──────────────────┐
│  build-and-push  │  docker build → docker push (Docker Hub)
└────────┬─────────┘
         │ (passou)
         ▼
┌──────────────────┐
│     deploy       │  SCP docker-compose → cria .env → docker compose up (EC2)
└──────────────────┘
```

Se qualquer job falhar, os seguintes não executam — o deploy nunca acontece com código com erro.

---

## 13. Infraestrutura Terraform

### Recursos provisionados na AWS

| Recurso | Finalidade |
|---|---|
| `aws_vpc` | Rede isolada para o projeto |
| `aws_internet_gateway` | Saída para a internet a partir da VPC |
| `aws_subnet` (pública) | Sub-rede com IP público automático |
| `aws_route_table` | Encaminha tráfego da subnet para o IGW |
| `aws_security_group` | Permite SSH (22), HTTP (80) e porta da app (3000) |
| `aws_instance` (EC2 Ubuntu) | Servidor de aplicação com Docker pré-instalado |

A instância EC2 é provisionada com um script `user_data` que instala o Docker Engine e o Docker Compose plugin automaticamente na primeira inicialização, sem intervenção manual.

### Variáveis principais

| Variável | Padrão | Descrição |
|---|---|---|
| `aws_region` | `us-east-1` | Região AWS |
| `project_name` | `api-cifras` | Prefixo para nomes de recursos |
| `environment` | `dev` | Ambiente |
| `instance_type` | `t3.micro` | Tipo da instância EC2 |
| `key_pair_name` | — | Nome do key pair SSH existente na AWS (obrigatório) |

### Criando a infraestrutura

```bash
# 1. Exportar credenciais AWS
export AWS_ACCESS_KEY_ID="sua-chave"
export AWS_SECRET_ACCESS_KEY="sua-chave-secreta"

# 2. Criar key pair SSH na AWS (apenas na primeira vez)
aws ec2 create-key-pair \
  --key-name api-cifras-key \
  --region us-east-1 \
  --query 'KeyMaterial' \
  --output text > api-cifras-key.pem
chmod 400 api-cifras-key.pem

# 3. Inicializar e aplicar
cd terraform
terraform init
terraform apply -var="key_pair_name=api-cifras-key"

# 4. Obter o IP público (usado como EC2_HOST no GitHub)
terraform output ec2_public_ip

# 5. Destruir quando não precisar mais (evita cobrança)
terraform destroy -var="key_pair_name=api-cifras-key"
```

### Outputs

| Output | Descrição |
|---|---|
| `ec2_public_ip` | IP público da instância (usar como `EC2_HOST`) |
| `ec2_public_dns` | DNS público da instância |
| `app_url` | URL base da aplicação |

---

## 14. Secrets do GitHub Actions

Configure em **Settings → Secrets and variables → Actions** do repositório:

| Secret | Descrição | Como obter |
|---|---|---|
| `DOCKER_USERNAME` | Usuário do Docker Hub | Conta Docker Hub |
| `DOCKER_PASSWORD` | Senha/token do Docker Hub | Conta Docker Hub |
| `EC2_HOST` | IP público da EC2 | `terraform output ec2_public_ip` |
| `EC2_USER` | Usuário SSH da EC2 | `ubuntu` (padrão AMI Ubuntu) |
| `EC2_SSH_KEY` | Chave privada SSH (conteúdo do `.pem`) | Arquivo `api-cifras-key.pem` |
| `DB_HOST` | Host do banco de dados | `localhost` se o banco rodar na EC2 |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do banco | — |
| `DB_PASSWORD` | Senha do banco | — |
| `DB_NAME` | Nome do banco | `api_cifras` |

---

## 15. Fluxo CI/CD Completo

```
Desenvolvedor abre Pull Request
           │
           ▼
   ci.yml: lint + test + build
           │
    ┌──────┴──────┐
    │  Falhou?    │ ──► PR bloqueado para merge
    └──────┬──────┘
           │ (passou)
           ▼
   PR aprovado e mesclado em main
           │
           ▼
   cd.yml job 1: build-and-test
           │
    ┌──────┴──────┐
    │  Falhou?    │ ──► Pipeline para, sem deploy
    └──────┬──────┘
           │ (passou)
           ▼
   cd.yml job 2: build-and-push
   (docker build + push para Docker Hub)
           │
    ┌──────┴──────┐
    │  Falhou?    │ ──► Pipeline para, sem deploy
    └──────┬──────┘
           │ (passou)
           ▼
   cd.yml job 3: deploy
   (SCP docker-compose → cria .env → docker compose up na EC2)
           │
           ▼
   Nova versão em produção
```

---

## 16. Possíveis Melhorias Futuras

- **Migrations**: substituir o `init.sql` por um sistema de migrations (ex.: `node-pg-migrate`) para controle versionado do schema.
- **Autenticação**: adicionar JWT para proteger os endpoints de escrita.
- **Paginação**: implementar paginação no `GET /songs` para lidar com grandes volumes.
- **Cache**: usar Redis para cachear listagens frequentes.
- **Monitoramento**: integrar com CloudWatch ou Prometheus/Grafana.
- **HTTPS**: adicionar certificado TLS via AWS Certificate Manager + ALB.
- **Banco em container**: adicionar serviço PostgreSQL no docker-compose para ambiente de produção autocontido.
