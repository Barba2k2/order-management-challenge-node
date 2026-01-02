# Order Management API

API para gerenciamento de pedidos com Node.js, Express, Mongoose e TypeScript.

## Requisitos

- Docker e Docker Compose (recomendado)
- Ou: Node.js 18+ e MongoDB

## Execução com Docker (Recomendado)

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f app
```

A API estará disponível em `http://localhost:3000`

## Execução Local (sem Docker)

### Instalação

```bash
npm install
```

### Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

### Execução

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## Testes

```bash
# Rodar testes
npm test

# Rodar testes uma vez
npm run test:run

# Cobertura
npm run test:coverage
```

## Endpoints

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registrar usuário |
| POST | `/auth/login` | Login |

### Pedidos (Requer autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/orders` | Criar pedido |
| GET | `/orders` | Listar pedidos (paginado) |
| GET | `/orders/:id` | Buscar pedido por ID |
| PATCH | `/orders/:id/advance` | Avançar estado do pedido |

### Query Parameters (GET /orders)

- `page`: Página (default: 1)
- `limit`: Itens por página (default: 10)
- `state`: Filtrar por estado (CREATED, ANALYSIS, COMPLETED)

## Estrutura de Dados

### User
- `email` (unique)
- `password`

### Order
- `lab`, `patient`, `customer` (strings)
- `state`: CREATED -> ANALYSIS -> COMPLETED
- `status`: ACTIVE | DELETED
- `services`: Array de { name, value, status }

## Regras de Negócio

- Pedidos devem ter pelo menos um serviço
- Valor total dos serviços deve ser maior que zero
- Transição de estado segue ordem estrita: CREATED -> ANALYSIS -> COMPLETED
- Não é possível pular etapas ou retroceder
