# Backend Architecture

## Overview

The backend is organized as a modular .NET solution for the ERP platform. The current structure separates runtime APIs from reusable libraries and keeps each business module isolated across Domain, Application, and Infrastructure projects.

This backend must be developed as a foundation-first modular architecture. New implementation should preserve the current folder structure, avoid premature business logic, and keep module boundaries explicit.

## Solution Layout

```txt
backend/
  libraries/
    ERP.Shared/
    ERP.Core.Domain/
    ERP.Core.Application/
    ERP.Core.Infrastructure/
    ERP.Client.Domain/
    ERP.Client.Application/
    ERP.Client.Infrastructure/
    ERP.Infrastructure.IoC/
  runtimes/
    ERP.Auth.Api/
    ERP.Client.Api/
    ERP.Gateway.Api/
  tests/
```

## Project Responsibilities

### Runtime APIs

`backend/runtimes` contains executable ASP.NET Core applications.

- `ERP.Auth.Api`: API runtime for Core/Auth module composition.
- `ERP.Client.Api`: API runtime for Client module composition.
- `ERP.Gateway.Api`: gateway runtime. It should not own persistence unless explicitly required later.

Runtime projects should be thin. They should configure hosting, middleware, controllers, OpenAPI, and call IoC extension methods. Business rules, persistence details, and module registrations should stay in the library projects.

### Shared

`ERP.Shared` contains cross-module abstractions that are safe to share without creating module coupling.

Current responsibility:

- Shared persistence contracts such as `IUnitOfWork`.

Shared should not contain module-specific business rules, concrete infrastructure implementations, or API concerns.

### Domain Projects

Domain projects contain business entities, enums, value objects, and domain-only base types.

- `ERP.Core.Domain`: Core/Auth domain.
- `ERP.Client.Domain`: Client domain.

Domain rules:

- Domain must not reference Application, Infrastructure, APIs, EF Core, ASP.NET Core, or database packages.
- Entities should inherit from the module's `Common.Entity` base when they need identity.
- The default entity identifier is `Guid`.
- Domain types should be public when used outside their assembly.
- Keep domain logic independent from persistence and dependency injection.

### Application Projects

Application projects contain use-case orchestration through Application Services, DTOs, mappings, validators, and application-level abstractions.

- `ERP.Core.Application`: Core/Auth application layer.
- `ERP.Client.Application`: Client application layer.

Application rules:

- Use Application Services as the main orchestration pattern.
- Do not implement Command Handlers, Query Handlers, MediatR handlers, or CQRS handler classes in the current architecture.
- Application Services may depend on application abstractions, repository interfaces, Unit of Work contracts, validators, and domain objects.
- Application must not depend on concrete Infrastructure implementations.
- DTOs, mappings, validators, and service contracts should stay inside the module folders already defined.

### Infrastructure Projects

Infrastructure projects contain persistence, repositories, Unit of Work implementations, EF Core contexts, migrations, configurations, and external technical integrations.

- `ERP.Core.Infrastructure`: Core/Auth infrastructure.
- `ERP.Client.Infrastructure`: Client infrastructure.

Infrastructure rules:

- Each module has its own PostgreSQL database connection.
- Each module has its own `DbContext`.
- `DbContext` classes must not expose `DbSet` properties.
- Repositories should use `DbContext.Set<TEntity>()` internally.
- EF Core entity configurations belong in `Persistence/Configurations`.
- Migrations belong in `Persistence/Migrations`.
- Unit of Work implementations belong in `Persistence/UnitOfWork`.
- Repository implementations and repository base classes belong in `Persistence/Repositories`.

### Infrastructure IoC

`ERP.Infrastructure.IoC` is responsible for dependency injection composition.

It exposes module-level extension methods used by runtime APIs:

- `AddCoreModule(...)`
- `AddClientModule(...)`
- `AddCoreApplication(...)`
- `AddCoreInfrastructure(...)`
- `AddClientApplication(...)`
- `AddClientInfrastructure(...)`
- `AddShared(...)`

IoC rules:

- Register module dependencies in the module-specific extension methods.
- Keep API `Program.cs` files small by delegating registrations to IoC.
- Do not register command handlers or MediatR.
- Register concrete Infrastructure implementations behind Application or Shared abstractions.

## Persistence Model

The backend uses PostgreSQL through Entity Framework Core.

Database topology:

- Core/Auth uses `CoreConnection`.
- Client uses `ClientConnection`.
- Gateway has no database connection by default.

Context rules:

- `CoreDbContext` belongs to `ERP.Core.Infrastructure`.
- `ClientDbContext` belongs to `ERP.Client.Infrastructure`.
- Context constructors receive `DbContextOptions<TContext>`.
- Contexts use `ApplyConfigurationsFromAssembly(...)`.
- Contexts must not expose `DbSet<TEntity>` properties.

Repository rules:

- Repositories are module-specific.
- Repositories should be abstracted through Application-layer interfaces when consumed by Application Services.
- Concrete repository implementations belong in Infrastructure.
- Base repository classes may provide structural persistence operations only.
- Avoid putting business rules inside repositories.

Unit of Work rules:

- Application Services should commit changes through `IUnitOfWork`.
- Infrastructure provides module-specific implementations.
- `CommitAsync` persists changes.
- `RollbackAsync` clears pending tracked changes.

## Development Guidelines

### Preserve the Current Structure

Do not move, rename, or flatten the existing backend folders. New files should be added inside the folders already created for their responsibility.

Examples:

- New Core entity: `ERP.Core.Domain/Usuarios/Entities`.
- New Client entity: `ERP.Client.Domain/Clientes/Entities`.
- New Core validator: `ERP.Core.Application/Modules/Auth/Validators`.
- New Client service: `ERP.Client.Application/Modules/Clientes/Services`.
- New EF configuration: the module Infrastructure `Persistence/Configurations`.

### Use Application Services

Business use cases should be implemented through Application Services, not handlers.

Expected flow:

```txt
Controller
  -> Application Service
    -> Repository abstraction
    -> Domain entity/value object
    -> Unit of Work
```

Controllers should not call `DbContext` directly. Controllers should not contain business rules.

### Do Not Add Handlers

The current architecture intentionally avoids:

- Command classes
- Query classes
- Command handlers
- Query handlers
- MediatR pipeline behavior

If a future requirement introduces CQRS, it should be discussed and documented before changing this rule.

### Keep DbSet Out of DbContext

Do not add properties like:

```csharp
public DbSet<User> Users { get; set; }
```

Use repository methods backed by:

```csharp
Context.Set<TEntity>()
```

This keeps persistence access centralized in repositories and avoids leaking entity sets through the context.

### Keep Module Boundaries Clear

Core/Auth and Client are separate modules.

- Core code should not depend on Client-specific types.
- Client code should not depend on Core-specific types unless a future shared contract is intentionally introduced.
- Shared abstractions must remain generic and module-neutral.

### Add Logic Gradually

When adding real features, implement in this order:

1. Domain entity/value object/enum.
2. EF Core configuration.
3. Repository abstraction in Application.
4. Repository implementation in Infrastructure.
5. Application Service interface and implementation.
6. Validator and DTOs if needed.
7. Controller endpoint.
8. Tests.

Do not create migrations until the related entity mappings are ready.

## Validation Checklist

Before finishing backend structural changes, run:

```powershell
dotnet restore ERP.sln
dotnet build ERP.sln --no-restore
```

Also verify:

- No `DbSet` properties were added to DbContexts.
- No Command Handlers or Query Handlers were created.
- No MediatR dependency was introduced.
- APIs still use IoC extension methods for module registration.
- New files remain inside the current folder structure.

## Current Architectural Defaults

- Target framework: `.NET 10`.
- Database: PostgreSQL.
- Entity identifier: `Guid`.
- Module persistence: separated by physical database connection.
- Composition root: `ERP.Infrastructure.IoC`.
- Business orchestration: Application Services.
- Repository access: abstract repositories, with concrete persistence in Infrastructure.
- DbContext exposure: no `DbSet` properties.
