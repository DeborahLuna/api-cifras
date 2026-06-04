# api-cifras

API REST para gerenciamento de cifras musicais, desenvolvida com Node.js, TypeScript e PostgreSQL. Projeto acadêmico com foco em boas práticas de backend e DevOps.

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
11. [Pipeline GitHub Actions](#11-pipeline-github-actions)
12. [Infraestrutura Terraform](#12-infraestrutura-terraform)
13. [Fluxo de Integração Contínua](#13-fluxo-de-integração-contínua)
14. [Possíveis Melhorias Futuras](#14-possíveis-melhorias-futuras)

---

## 1. Descrição do Projeto

O **api-cifras** expõe uma API REST que permite criar, listar, atualizar e remover músicas com suas respectivas cifras. Cada música contém título, artista, tonalidade e a cifra da música.

O projeto foi construído sem ORM — o acesso ao banco de dados é feito com **SQL puro** via biblioteca [`pg`](https://node-postgres.com/). Essa escolha é intencional: o foco da disciplina é **DevOps, Integração Contínua e Infraestrutura como Código**, e não ferramentas de persistência avançadas. SQL puro também facilita a leitura e auditoria das queries.

---

## 2. Objetivos

- Implementar uma API REST seguindo a arquitetura MVC com separação clara de responsabilidades.
- Aplicar boas práticas de TypeScript (tipagem estrita, sem `any`).
- Garantir qualidade com testes automatizados (Jest + Supertest).
- Automatizar o processo de integração contínua com GitHub Actions.
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

Essa separação segue o princípio **Single Responsibility** do SOLID: cada camada tem um único motivo para mudar.

---

## 4. Estrutura de Pastas

```
api-cifras/
├── src/
│   ├── controllers/
│   │   └── song.controller.ts   # Recebe HTTP, chama service, devolve resposta
│   ├── services/
│   │   └── song.service.ts      # Regras de negócio, lança AppError quando necessário
│   ├── repositories/
│   │   └── song.repository.ts   # Queries SQL com pg; única camada que toca o banco
│   ├── models/
│   │   └── song.model.ts        # Converte row do PostgreSQL em objeto Song tipado
│   ├── routes/
│   │   ├── index.ts             # Agrega todas as rotas sob /api
│   │   └── song.routes.ts       # Define rotas /songs com injeção de dependências
│   ├── middlewares/
│   │   ├── errorHandler.ts      # Tratamento global de erros + classe AppError
│   │   └── validateRequest.ts   # Validação de payloads POST e PUT
│   ├── config/
│   │   ├── database.ts          # Instância do Pool do pg (lê .env)
│   │   └── init.sql             # Script SQL de criação do banco e tabelas
│   ├── types/
│   │   └── song.ts              # Interfaces Song, CreateSongDTO, UpdateSongDTO
│   ├── app.ts                   # Configura Express, middlewares globais e rotas
│   └── server.ts                # Ponto de entrada — faz o listen na porta
│
├── tests/
│   └── songs.test.ts            # Testes de integração com Supertest (mocks de DB)
│
├── terraform/
│   ├── provider.tf              # Configuração do provider AWS
│   ├── variables.tf             # Todas as variáveis parametrizadas
│   ├── main.tf                  # VPC, Subnet, IGW, Route Table, SG, EC2
│   └── outputs.tf               # IP/DNS da instância e URL da aplicação
│
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de CI: lint → test → build
│
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

- Node.js >= 20
- Yarn (`npm install -g yarn`)
- PostgreSQL >= 14

### Instalação

```bash
# Clone o repositório
git clone https://github.com/<seu-usuario>/api-cifras.git
cd api-cifras

# Instale as dependências
yarn install

# Copie e preencha o arquivo de variáveis de ambiente
cp .env.example .env
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

---

## 7. Banco de Dados

### Por que SQL puro?

O projeto usa a biblioteca `pg` diretamente, sem ORM (Prisma, TypeORM, Sequelize etc.). Essa decisão mantém o projeto alinhado ao foco da disciplina — **DevOps e CI/CD** — sem adicionar a complexidade de configuração e migração de um ORM. As queries ficam explícitas e auditáveis, o que facilita a compreensão de quem está aprendendo.

### Criação do banco

```bash
# Conecte ao PostgreSQL e execute o script de inicialização
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

```bash
# Modo desenvolvimento (hot-reload)
yarn dev

# Build de produção
yarn build

# Executar build compilado
yarn start
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
  "updated_at": "2024-01-01T00:00:00.000Z",
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

Os testes usam **Supertest** para fazer requisições HTTP reais contra a aplicação Express, e **Jest mocks** para isolar o banco de dados. Isso permite que o CI execute os testes sem precisar de um PostgreSQL em execução.

```bash
# Executar todos os testes
yarn test

# Executar com relatório de cobertura
yarn test:coverage
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

## 11. Pipeline GitHub Actions

Arquivo: `.github/workflows/ci.yml`

O pipeline é acionado em todo push ou pull request para a branch `main`.

```
Push para main
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
yarn lint          ← ESLint com @typescript-eslint
      │
      ▼
yarn test          ← Jest + Supertest (sem banco de dados)
      │
      ▼
yarn build         ← Compilação TypeScript
```

Se qualquer etapa falhar, o pipeline para e o commit fica marcado com status de falha. Não há deploy automático nesta fase.

---

## 12. Infraestrutura Terraform

### Recursos provisionados na AWS

| Recurso | Finalidade |
|---|---|
| `aws_vpc` | Rede isolada para o projeto |
| `aws_internet_gateway` | Saída para a internet a partir da VPC |
| `aws_subnet` (pública) | Sub-rede com IP público automático |
| `aws_route_table` | Encaminha tráfego da subnet para o IGW |
| `aws_security_group` | Permite SSH (22), HTTP (80) e porta da app (3000) |
| `aws_instance` (EC2 Ubuntu) | Servidor de aplicação |

### Variáveis principais

| Variável | Padrão | Descrição |
|---|---|---|
| `aws_region` | `us-east-1` | Região AWS |
| `project_name` | `api-cifras` | Prefixo para nomes de recursos |
| `environment` | `dev` | Ambiente |
| `instance_type` | `t3.micro` | Tipo da instância EC2 |
| `allowed_ssh_cidr` | `0.0.0.0/0` | CIDR permitido para SSH |

### Comandos

```bash
cd terraform

# 1. Inicializar o backend e baixar providers
terraform init

# 2. Ver o plano de execução (sem criar nada)
terraform plan

# 3. Aplicar a infraestrutura
terraform apply

# 4. Destruir todos os recursos
terraform destroy
```

### Credenciais AWS

Não há credenciais no código. Configure-as via variáveis de ambiente antes de rodar o Terraform:

```bash
export AWS_ACCESS_KEY_ID="sua-chave"
export AWS_SECRET_ACCESS_KEY="sua-chave-secreta"
export AWS_DEFAULT_REGION="us-east-1"
```

### Outputs

Após o `terraform apply`, os seguintes valores são exibidos:

- `ec2_public_ip` — IP público da instância
- `ec2_public_dns` — DNS público da instância
- `app_url` — URL base da aplicação

---

## 13. Fluxo de Integração Contínua

```
Desenvolvedor faz push para main
           │
           ▼
   GitHub Actions dispara CI
           │
    ┌──────┴──────┐
    │  Lint falha? │ ──► Build marcado como FAILED
    └──────┬──────┘
           │ (passou)
    ┌──────┴──────┐
    │ Testes falham?│ ──► Build marcado como FAILED
    └──────┬──────┘
           │ (passou)
    ┌──────┴──────┐
    │ Build falha? │ ──► Build marcado como FAILED
    └──────┬──────┘
           │ (passou)
    Build marcado como SUCCESS
```

O desenvolvedor só recebe o sinal verde se todas as etapas passarem. Não há CD (Continuous Delivery) nesta fase.

---

## 14. Possíveis Melhorias Futuras

- **Docker & Docker Compose**: containerizar a aplicação e o banco para facilitar execução local e deploy.
- **CD (Continuous Delivery)**: adicionar etapa de deploy automático para EC2 após CI verde.
- **Migrations**: substituir o `init.sql` por um sistema de migrations (ex.: `node-pg-migrate`) para controle versionado do schema.
- **Autenticação**: adicionar JWT para proteger os endpoints de escrita.
- **Paginação**: implementar paginação no `GET /songs` para lidar com grandes volumes.
- **Cache**: usar Redis para cachear listagens frequentes.
- **Monitoramento**: integrar com CloudWatch ou Prometheus/Grafana.
- **HTTPS**: adicionar certificado TLS via AWS Certificate Manager + ALB.
