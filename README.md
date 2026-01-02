# Order Management API

API RESTful para gerenciamento de pedidos laboratoriais.

## Stack

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** para autenticação
- **Zod** para validação
- **Vitest** para testes (27 testes)
- **Docker** + **Docker Compose**

## Estrutura do Projeto

```
src/
├── config/          # Configurações (database, env)
├── controllers/     # Controllers HTTP
├── domain/          # Entidades e Enums
├── dtos/            # Schemas de validação (Zod)
├── middlewares/     # Auth, Error, Rate Limit
├── models/          # Mongoose Models
├── repositories/    # Acesso a dados
├── routes/          # Definição de rotas
├── services/        # Regras de negócio
└── shared/          # Classes compartilhadas
```

## Execução

### Com Docker (Recomendado)

```bash
docker-compose up -d
```

A API estará em `http://localhost:3000`

### Sem Docker

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Desenvolvimento
npm run dev

# Build e produção
npm run build && npm start
```

## Testes

```bash
npm run test:run    # Executar testes
npm run test:coverage  # Com cobertura
```

## Endpoints

### Autenticação

```
POST /auth/register  - Registrar usuário
POST /auth/login     - Login (retorna JWT)
```

### Pedidos (Requer Bearer Token)

```
POST   /orders              - Criar pedido
GET    /orders              - Listar pedidos
GET    /orders/:id          - Buscar por ID
PATCH  /orders/:id/advance  - Avançar estado
```

### Filtros (GET /orders)

- `page` - Página (default: 1)
- `limit` - Itens por página (default: 10)
- `state` - Filtrar por estado (CREATED, ANALYSIS, COMPLETED)

## Exemplos

### Registro

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Criar Pedido

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "lab": "Lab A",
    "patient": "John Doe",
    "customer": "Customer X",
    "services": [{"name": "Exame 1", "value": 150}]
  }'
```

### Avançar Estado

```bash
curl -X PATCH http://localhost:3000/orders/<id>/advance \
  -H "Authorization: Bearer <token>"
```

## Regras de Negócio

- Pedidos devem ter pelo menos um serviço
- Valor total dos serviços deve ser maior que zero
- Transição de estado segue ordem estrita: `CREATED` -> `ANALYSIS` -> `COMPLETED`
- Ao completar, todos os serviços são marcados como `DONE`
- Não é possível pular etapas ou retroceder
