# Desafio Técnico Backend

**Objetivo:** Avaliar organização de código, domínio de TypeScript e implementação de regras de negócio.
**Stack:** Node.js, Express, Mongoose, TypeScript.
**Testes:** Vitest (Diferencial).

### Estrutura de Dados

**1. User**

* `email` (unique), `password`.

**2. Order**

* Campos: `lab`, `patient`, `customer` (strings).
* `state`: `CREATED` -> `ANALYSIS` -> `COMPLETED`.
* `status`: `ACTIVE` | `DELETED`.
* `services` (Array obrigatório): `{ name: string, value: number, status: 'PENDING' | 'DONE' }`.

---

### ETAPA 1: Essencial (Obrigatório)

1. **Autenticação:**
* Registro e Login retornando JWT.
* Middleware de proteção para rotas de pedidos.


2. **Gestão de Pedidos:**
* **POST /orders:** Criação do pedido. Padrão: `state: CREATED`, `status: ACTIVE`.
* **GET /orders:** Listagem com paginação e filtro por `state`.



---

### ETAPA 2: Diferencial (Regras e Qualidade)

1. **Validação de Negócio:**
* Não permitir criação de pedidos sem serviços ou com valor total zerado.


2. **Fluxo de Status:**
* Endpoint `PATCH /orders/:id/advance`.
* A transição deve respeitar a ordem estrita: `CREATED` -> `ANALYSIS` -> `COMPLETED`.
* Bloquear tentativas de pular etapas ou retroceder.


3. **Testes (Vitest):**
* Teste unitário garantindo que a lógica de transição de `state` funciona e bloqueia ações inválidas.



---

### Critérios de Avaliação

* **Arquitetura:** Separação de responsabilidades e clareza.
* **TypeScript:** Uso correto de tipagem.
* **Mongoose:** Modelagem e queries eficientes.
* **Commits:** Histórico e organização no Git.

---

### 📅 Prazo de Entrega

A data limite para submissão do link do repositório é **04/01**. Envios após essa data não serão considerados. Bom código!"

**Entrega:** Link do repositório com instruções de execução no README.