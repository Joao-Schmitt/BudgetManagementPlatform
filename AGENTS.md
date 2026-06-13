# AGENTS.md

## Objetivo do projeto

Este repositório contém um sistema de geração de orçamentos, com backend, frontend, banco de dados e documentação técnica.

Antes de implementar qualquer alteração, siga os padrões definidos neste arquivo e consulte as skills/documentações relevantes.

---

## Estrutura relevante

- `.agents/skills/`
  - `angular-best-practices`
  - `angular-developer`
  - `design-taste-frontend`
  - `dotnet-backend-patterns`
  - `dotnet-best-practices`
  - `frontend-design`
  - `postgresql-optimization`
  - `ui-ux-pro-max`

- `docs/`
  - `angular-architecture.md`
  - `backend-architecture.md`

- `backend/`
  - Código backend da aplicação.

- `frontend/`
  - Código frontend da aplicação.

- `database/`
  - Scripts, migrations ou artefatos relacionados ao banco de dados.

## Regra principal

Antes de alterar qualquer código, analise o contexto existente do projeto.

Não crie padrões novos se já existir uma estrutura equivalente no repositório.

Sempre prefira seguir os arquivos de documentação e skills do projeto.

---

## Leitura obrigatória por tipo de tarefa

### Backend .NET

Para qualquer alteração em backend, APIs, autenticação, serviços, repositories, domínio, banco ou regras de negócio, leia primeiro:

- `.agents/skills/dotnet-backend-patterns`
- `.agents/skills/dotnet-best-practices`
- `docs/backend-architecture.md`

---


### Frontend Angular

Para qualquer alteração no frontend Angular, leia primeiro:

- `.agents/skills/angular-best-practices`
- `.agents/skills/angular-developer`
- `.agents/skills/frontend-design`
- `docs/angular-architecture.md`


### UI/UX e design

Para qualquer alteração visual, layout, responsividade, telas, grids, cards, headers, menus ou experiência do usuário, leia primeiro:

- `.agents/skills/design-taste-frontend`
- `.agents/skills/frontend-design`
- `.agents/skills/ui-ux-pro-max`

Regras obrigatórias:

- Interface deve ser moderna, compacta e profissional.
- Priorizar usabilidade em sistemas ERP com muitos registros.
- Evitar excesso de espaço em branco.
- Manter hierarquia visual clara.
- Tabelas/grids devem ser legíveis, compactas e eficientes.
- Evitar componentes grandes sem necessidade.
- Manter consistência entre cores, espaçamentos, bordas e tipografia.

---

## Fluxo esperado antes de implementar

Antes de alterar arquivos:

1. Identifique se a tarefa é de backend, frontend, UI/UX, banco ou múltiplas áreas.
2. Leia as skills correspondentes em `.agents/skills/`.
3. Leia a documentação aplicável em `docs/`.
4. Analise arquivos existentes parecidos com a alteração solicitada.
5. Siga o padrão já usado no projeto.
6. Só então implemente.


---

## Padrões gerais de código

- Código deve ser claro, simples e sustentável.
- Evite overengineering.
- Evite duplicação.
- Prefira nomes explícitos.
- Não crie abstrações sem necessidade real.
- Não remova código existente sem entender o impacto.
- Não altere contratos públicos sem necessidade.
- Não faça mudanças fora do escopo solicitado.