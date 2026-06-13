# Angular Architecture & Best Practices Guide for Codex

> Use este arquivo como referência obrigatória ao gerar, alterar ou refatorar código Angular neste projeto.
> Priorize Angular moderno com standalone components, funções, `inject()`, rotas lazy-loaded, signals quando fizer sentido e serviços pequenos.

---

## 1. Objetivo

Este projeto deve seguir uma arquitetura Angular simples, funcional, escalável e fácil de manter.

O Codex deve sempre priorizar:

- Código claro, previsível e tipado.
- Baixo acoplamento entre telas, serviços e componentes.
- Componentes pequenos e focados em UI.
- Regras de negócio fora dos componentes visuais.
- Uso de standalone components.
- Uso de `inject()` em vez de constructor injection quando for coerente com o padrão do projeto.
- Rotas organizadas por feature.
- Lazy loading para páginas/features.
- Services com responsabilidade única.
- Interfaces/types explícitos para contratos de API.
- Evitar soluções “mágicas”, genéricas demais ou difíceis de debugar.

---

## 2. Estrutura recomendada

Use uma estrutura por feature, evitando agrupar tudo por tipo técnico.

```text
src/
  app/
    core/
      auth/
      http/
      guards/
      interceptors/
      layout/
      config/
    shared/
      components/
      directives/
      pipes/
      utils/
      models/
    features/
      customers/
        pages/
        components/
        services/
        models/
        routes.ts
      products/
        pages/
        components/
        services/
        models/
        routes.ts
    app.config.ts
    app.routes.ts
    app.component.ts
  environments/
```

### Regras

- `core/`: código global da aplicação: autenticação, interceptors, guards, configurações, layout principal.
- `shared/`: código reutilizável e sem dependência direta de regra de negócio específica.
- `features/`: módulos funcionais da aplicação, como clientes, produtos, orçamentos, usuários etc.
- Cada feature deve ter seus próprios `pages`, `components`, `services`, `models` e `routes.ts` quando necessário.
- Não colocar regra de negócio dentro de `shared`.
- Não criar uma pasta `services` global para tudo.

---

## 3. Standalone components

Todo componente novo deve ser standalone.

```ts
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-list.page.html',
  styleUrl: './customer-list.page.scss'
})
export class CustomerListPage {}
```

### Regras

- Não criar `NgModule` novo, exceto se houver uma necessidade real de compatibilidade.
- Declarar dependências no `imports` do próprio componente.
- Separar páginas de componentes internos:
  - `pages/`: componentes usados diretamente nas rotas.
  - `components/`: componentes menores usados dentro da feature.

---

## 4. Rotas e lazy loading

As rotas principais devem carregar features sob demanda.

```ts
export const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/routes').then(m => m.CUSTOMER_ROUTES)
  }
];
```

Na feature:

```ts
export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customer-list/customer-list.page')
        .then(m => m.CustomerListPage)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/customer-detail/customer-detail.page')
        .then(m => m.CustomerDetailPage)
  }
];
```

### Regras

- Usar `loadChildren` para features.
- Usar `loadComponent` para páginas standalone.
- Evitar importar páginas diretamente no `app.routes.ts` quando elas pertencem a uma feature.
- Guards devem ser funcionais sempre que possível.

---

## 5. Guards funcionais

Preferir guards funcionais ao invés de classes.

```ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

### Regras

- Guards não devem conter regra de negócio complexa.
- Delegar validações para services.
- Usar `UrlTree` para redirecionar em vez de chamar `router.navigate()` dentro do guard.
- Não confiar apenas no frontend para segurança. A API também deve validar permissões.

---

## 6. Services

Services devem concentrar comunicação HTTP, estado de feature ou regras específicas.

```ts
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, request);
  }

  update(id: string, request: UpdateCustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Regras

- Services não devem manipular diretamente DOM.
- Services HTTP devem retornar `Observable<T>`.
- Não fazer subscribe dentro de service HTTP simples, exceto em services de estado quando fizer sentido.
- Não misturar várias entidades no mesmo service.
- Não criar services genéricos demais se isso dificultar leitura e manutenção.

---

## 7. Models, interfaces e contratos

Criar models claros para requests, responses e entidades usadas na tela.

```ts
export interface Customer {
  id: string;
  name: string;
  document: string;
  email?: string;
  active: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  document: string;
  email?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  active: boolean;
}
```

### Regras

- Evitar `any`.
- Preferir `unknown` quando o tipo realmente não for conhecido.
- Separar tipos de request e response quando eles forem diferentes.
- Não reutilizar DTO de API como modelo de formulário se os campos forem diferentes.
- Usar nomes explícitos: `CreateBudgetRequest`, `BudgetResponse`, `BudgetListItem`.

---

## 8. HTTP e interceptors funcionais

Configurar HTTP no `app.config.ts`.

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    )
  ]
};
```

Interceptor funcional:

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest);
};
```

### Regras

- Preferir interceptors funcionais com `withInterceptors`.
- Usar `withCredentials: true` quando autenticação for via cookie HttpOnly.
- Não armazenar token sensível em `localStorage` se o sistema usa cookies HttpOnly.
- Interceptor de erro deve tratar erros globais, mas não esconder erros específicos da tela.
- Não fazer redirecionamentos excessivos ou loops em caso de 401.

---

## 9. Estado da aplicação

Usar estado local sempre que possível. Só criar estado global quando realmente necessário.

### Ordem de preferência

1. Estado local no componente.
2. Estado em service da feature.
3. Estado global apenas para dados compartilhados por toda a aplicação, como usuário logado, permissões e tema.

Exemplo com signals:

```ts
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly currentUserSignal = signal<UserSession | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  setCurrentUser(user: UserSession | null): void {
    this.currentUserSignal.set(user);
  }
}
```

### Regras

- Não usar estado global para tudo.
- Não duplicar o mesmo estado em vários services.
- Usar signals para estado síncrono de UI quando fizer sentido.
- Usar RxJS para fluxos assíncronos, eventos, HTTP e composição de streams.

---

## 10. RxJS

Usar RxJS de forma simples e legível.

```ts
readonly customers$ = this.refresh$.pipe(
  startWith(void 0),
  switchMap(() => this.customerService.getAll()),
  catchError(error => {
    this.notificationService.error('Erro ao carregar clientes.');
    return of([]);
  })
);
```

### Regras

- Evitar subscribe aninhado.
- Preferir `switchMap`, `concatMap`, `mergeMap` ou `exhaustMap` conforme o caso.
- Usar `async` pipe quando possível.
- Cancelar subscriptions manuais com `takeUntilDestroyed()`.
- Não deixar subscriptions abertas.

Exemplo:

```ts
private readonly destroyRef = inject(DestroyRef);

ngOnInit(): void {
  this.form.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(value => {
      this.handleFormChange(value);
    });
}
```

---

## 11. Componentes

Componentes devem ser focados em apresentação e orquestração simples.

### Regras

- Não colocar chamadas HTTP espalhadas em vários métodos sem organização.
- Não colocar regra de negócio pesada no componente.
- Não criar componentes gigantes.
- Extrair partes repetidas para componentes menores.
- Inputs e outputs devem ser explícitos.
- Evitar herança entre componentes. Preferir composição.

Exemplo:

```ts
@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})
export class CustomerCardComponent {
  @Input({ required: true }) customer!: Customer;
  @Output() edit = new EventEmitter<Customer>();
  @Output() remove = new EventEmitter<Customer>();
}
```

---

## 12. Formulários

Preferir Reactive Forms para telas de cadastro, filtros complexos e validações.

```ts
readonly form = this.formBuilder.nonNullable.group({
  name: ['', [Validators.required, Validators.maxLength(120)]],
  email: ['', [Validators.email]],
  active: [true]
});
```

### Regras

- Usar `ReactiveFormsModule`.
- Validar no frontend para UX, mas manter validação real no backend.
- Não montar payload direto com campos desnecessários do form.
- Criar métodos para converter form em request quando necessário.

```ts
private buildRequest(): CreateCustomerRequest {
  const value = this.form.getRawValue();

  return {
    name: value.name.trim(),
    email: value.email?.trim() || undefined,
    document: onlyNumbers(value.document)
  };
}
```

---

## 13. Tratamento de erros

Padronizar tratamento de erros.

```ts
export interface ApiError {
  message: string;
  code?: string;
  details?: string[];
}
```

### Regras

- Erros globais: interceptor.
- Erros específicos da tela: componente/service da feature.
- Não exibir stack trace para usuário.
- Não engolir erro silenciosamente.
- Mensagens devem ser claras e úteis.

---

## 14. Loading e feedback visual

Cada tela deve ter estados claros:

- Carregando.
- Sem dados.
- Erro.
- Dados carregados.
- Salvando/processando.

Evite botões que podem ser clicados várias vezes durante uma operação.

```html
<button type="submit" [disabled]="form.invalid || saving()">
  {{ saving() ? 'Salvando...' : 'Salvar' }}
</button>
```

---

## 15. Segurança no frontend

### Regras

- Nunca armazenar senhas, secrets, refresh tokens ou dados sensíveis no `localStorage`.
- Para autenticação com cookie, usar cookie HttpOnly, Secure e SameSite adequado no backend.
- Não confiar em permissões apenas no Angular.
- Não renderizar HTML vindo da API com `innerHTML` sem necessidade real.
- Evitar `bypassSecurityTrustHtml`, `bypassSecurityTrustUrl` etc.
- Não expor chaves privadas ou secrets em `environment.ts`.

---

## 16. Estilo de código

### Regras gerais

- Usar TypeScript com tipos explícitos em contratos públicos.
- Evitar `any`.
- Usar nomes descritivos.
- Não abreviar nomes importantes.
- Manter arquivos pequenos.
- Não misturar idiomas no mesmo contexto. Preferir inglês em código.
- Não criar comentários óbvios.
- Comentar apenas decisões de negócio ou trechos não triviais.

Exemplos bons:

```ts
loadCustomers(): void {}
createBudget(): void {}
calculateTotal(): number {}
```

Exemplos ruins:

```ts
fazCoisa(): void {}
proc(): void {}
data(): any {}
```

---

## 17. Nomenclatura de arquivos

Use nomes consistentes e claros.

```text
customer-list.page.ts
customer-form.component.ts
customer.service.ts
customer.model.ts
customer.routes.ts
auth.interceptor.ts
auth.guard.ts
```

### Sufixos recomendados

- `.page.ts` para componentes usados diretamente em rota.
- `.component.ts` para componentes reutilizáveis.
- `.service.ts` para services.
- `.guard.ts` para guards.
- `.interceptor.ts` para interceptors.
- `.model.ts` para models/interfaces.
- `.routes.ts` para rotas de feature.

---

## 18. Organização de imports

### Regras

- Imports do Angular primeiro.
- Depois bibliotecas externas.
- Depois imports internos do projeto.
- Remover imports não usados.
- Evitar caminhos relativos muito longos quando o projeto tiver aliases configurados.

Exemplo:

```ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
```

---

## 19. Configurações e environments

### Regras

- URLs de API devem vir de `environment` ou configuração central.
- Não hardcodar URL de backend em services.
- Não colocar segredo no frontend.
- Separar configurações de dev, homologação e produção.

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api'
};
```

---

## 20. Layout e UI

### Regras

- Criar componentes reutilizáveis para layout principal.
- Não repetir header/sidebar em cada página.
- Telas operacionais devem ser compactas, claras e consistentes.
- Evitar excesso de espaçamento em grids, filtros e formulários.
- Estados vazios devem informar claramente o que aconteceu.
- Componentes visuais devem receber dados por input sempre que possível.

---

## 21. Performance

### Regras

- Usar lazy loading para features.
- Evitar lógica pesada no template.
- Evitar chamadas de função complexas diretamente no HTML.
- Usar `trackBy` ou `track` em listas.
- Evitar subscriptions desnecessárias.
- Evitar re-renderização por estado mal organizado.

Exemplo com `@for`:

```html
@for (customer of customers(); track customer.id) {
  <app-customer-card [customer]="customer" />
}
```

---

## 22. Testes

### Regras

- Testar services com dependências mockadas.
- Testar guards e interceptors críticos.
- Testar regras de transformação de dados.
- Não depender de backend real em teste unitário.
- Para HTTP, usar ferramentas de teste do Angular para mockar requests.

---

## 23. O que o Codex deve evitar

O Codex não deve:

- Criar `NgModule` sem necessidade.
- Usar `any` por conveniência.
- Colocar regra de negócio pesada em componente.
- Criar services genéricos complexos demais.
- Duplicar models sem motivo.
- Fazer subscribe dentro de subscribe.
- Criar arquivos enormes.
- Misturar português e inglês no código.
- Guardar token sensível em `localStorage`.
- Ignorar erros HTTP.
- Fazer alterações grandes sem respeitar a estrutura existente.
- Introduzir bibliotecas novas sem necessidade clara.

---

## 24. Checklist antes de finalizar uma alteração

Antes de concluir uma tarefa, verificar:

- [ ] O código compila.
- [ ] Não há imports inutilizados.
- [ ] Não foi usado `any` desnecessariamente.
- [ ] A feature está na pasta correta.
- [ ] Componentes estão pequenos e focados.
- [ ] Services têm responsabilidade clara.
- [ ] Rotas usam lazy loading quando aplicável.
- [ ] Erros e loading foram tratados.
- [ ] Não há dados sensíveis expostos no frontend.
- [ ] O padrão visual e estrutural do projeto foi preservado.

---

## 25. Exemplo de feature completa

```text
features/
  budgets/
    pages/
      budget-list/
        budget-list.page.ts
        budget-list.page.html
        budget-list.page.scss
      budget-detail/
        budget-detail.page.ts
        budget-detail.page.html
        budget-detail.page.scss
    components/
      budget-form/
        budget-form.component.ts
        budget-form.component.html
        budget-form.component.scss
    services/
      budget.service.ts
    models/
      budget.model.ts
      budget-request.model.ts
    routes.ts
```

`routes.ts`:

```ts
export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/budget-list/budget-list.page')
        .then(m => m.BudgetListPage)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/budget-detail/budget-detail.page')
        .then(m => m.BudgetDetailPage)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/budget-detail/budget-detail.page')
        .then(m => m.BudgetDetailPage)
  }
];
```

---

## 26. Diretriz final para o Codex

Ao alterar este projeto, o Codex deve primeiro entender a estrutura existente e adaptar a solução ao padrão atual. Caso encontre código legado, deve melhorar gradualmente sem reescrever tudo sem necessidade.

A prioridade é entregar código Angular moderno, funcional, limpo, seguro, testável e adequado para um sistema profissional.