# Growth ERP

Sistema SaaS de gestao e crescimento de negocios para PME angolanas.

## Stack

- Monorepo com `pnpm`
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, ShadCN UI-style components, Zustand
- Backend: NestJS, Prisma ORM, PostgreSQL
- Infraestrutura: Docker e Docker Compose

## Estrutura

```txt
apps/web       Frontend Next.js
apps/api       API REST NestJS
packages/shared Tipos, DTOs e utilitarios partilhados
packages/ui      Componentes UI partilhados
```

## Executar localmente com Docker

```bash
cp .env.example .env
docker compose up --build
```

Depois, em outro terminal:

```bash
docker compose exec api pnpm prisma:migrate
docker compose exec api pnpm prisma:seed
```

- Web: http://localhost:3000
- API: http://localhost:3333/api
- Swagger: http://localhost:3333/docs

## Executar no GitHub Codespaces

1. Abrir o repositório no GitHub Codespaces.
2. Esperar o `postCreateCommand` instalar as dependências com `pnpm install`.
3. O Codespace executa `docker compose up --build` no attach.
4. Abrir as portas encaminhadas:
   - Web: porta `3000`
   - API/Swagger: porta `3333`

URLs dentro do Codespaces:

```txt
Web: https://<codespace>-3000.app.github.dev
API: https://<codespace>-3333.app.github.dev/api
Swagger: https://<codespace>-3333.app.github.dev/docs
```

Comandos úteis no terminal do Codespaces:

```bash
docker compose ps
docker compose logs api --tail=100
docker compose logs postgres --tail=50
docker compose exec api pnpm prisma migrate status
docker compose exec api pnpm prisma generate
docker compose exec api pnpm build
```

Se precisares reiniciar tudo:

```bash
docker compose down
docker compose up --build
```

## Fluxo Sprint 2

1. `POST /api/auth/register` cria a empresa com status `PENDING`, cria o utilizador `OWNER` e cria a subscricao `FREE`.
2. Enquanto a empresa estiver `PENDING`, o utilizador pode consultar `GET /api/me`, `GET /api/companies/current`, atualizar `PATCH /api/companies/current` e fazer `POST /api/auth/logout`.
3. Operacoes sensiveis como clientes, produtos, facturas e dashboard operacional ficam bloqueadas com a mensagem `Empresa pendente de aprovação.`
4. Apos aprovacao administrativa da empresa para `ACTIVE`, o acesso completo fica liberado.

Notas:

- A API usa prefixo global `/api`.
- A documentacao Swagger fica em `/docs`, sem o prefixo `/api`.
- O header `x-company-id` so e aceite depois de validado contra o utilizador autenticado.

## Sprint 3: Clientes e Produtos

Endpoints de clientes:

```txt
GET    /api/customers
GET    /api/customers?search=texto
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
DELETE /api/customers/:id
```

Endpoints de produtos e servicos:

```txt
GET    /api/products
GET    /api/products?search=texto&type=PRODUCT
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Notas da Sprint 3:

- Todas as queries usam o `companyId` do contexto autenticado.
- Produtos suportam `PRODUCT` e `SERVICE`.
- Produtos usam stock decimal, stock minimo, IVA por produto e estado `active`.
- `DELETE /api/products/:id` desativa o produto com `active=false`, preservando historico fiscal.
- As telas `/customers` e `/products` incluem pesquisa, criacao, edicao e remocao/desativacao.

## Utilizador seed

- Email: `admin@growtherp.ao`
- Password: `Password123!`

## Comandos uteis sem Docker

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
pnpm test
```
