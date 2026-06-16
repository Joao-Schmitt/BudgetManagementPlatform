# Backend Architecture

## Overview

The backend is organized as a layered .NET solution for the Budgets platform. The current structure separates the executable API runtime from reusable libraries and keeps domain, application, infrastructure, shared abstractions, and dependency injection composition in distinct projects.

New implementation should preserve the current folder structure, avoid premature business logic, and follow the patterns already used by the existing entities, services, repositories, configurations, and controllers.

## Solution Layout

```txt
backend/
  libraries/
    Budgets.Shared/
    Budgets.Domain/
    Budgets.Application/
    Budgets.Infrastructure/
    Budgets.Infrastructure.IoC/
  runtimes/
    Budgets.Api/
  tests/
```

The solution file lives at the repository root:

```txt
Budgets.sln
```

## Project Responsibilities

### Runtime API

`backend/runtimes/Budgets.Api` is the executable ASP.NET Core application.

Responsibilities:

- Configure hosting, controllers, middleware, authentication, CORS, rate limiting, exception handling, health checks, and OpenAPI/API runtime concerns.
- Expose controllers and runtime contracts.
- Call the infrastructure composition extension from `Budgets.Infrastructure.IoC`.

Runtime rules:

- Keep `Program.cs` thin.
- Do not access `BudgetsDbContext` directly from controllers.
- Do not place business rules in controllers.
- Do not register persistence and repository details directly in `Program.cs` when they belong in IoC.

### Shared

`Budgets.Shared` contains abstractions and simple cross-cutting types that can be safely shared without coupling one feature to another.

Current responsibilities include:

- Base abstractions such as `Entity`.
- Persistence contracts such as `IRepository<TEntity>` and `IUnitOfWork`.
- Result and security helper types.

Shared rules:

- Do not place feature-specific business rules in `Budgets.Shared`.
- Do not place concrete infrastructure implementations in `Budgets.Shared`.
- Do not add API runtime concerns to `Budgets.Shared`.

### Domain

`Budgets.Domain` contains domain entities and repository abstractions grouped by feature.

Current examples:

```txt
Budgets.Domain/
  Cliente/
    Entities/
    Interfaces/
  Produto/
    Entities/
    Interfaces/
  User/
    Entities/
    Interfaces/
  Template/
    Entites/
    Interfaces/
```

Domain rules:

- Domain must not reference Application, Infrastructure, runtime APIs, EF Core, ASP.NET Core, or database packages.
- Entities that need identity should inherit from `Budgets.Shared.Abstractions.Entity`.
- The default entity identifier is `Guid`.
- Repository interfaces belong in the feature's `Interfaces` folder under `Budgets.Domain`.
- Domain types should be public when used outside their assembly.
- Keep domain logic independent from persistence and dependency injection.
- Preserve existing folder names when adding to an existing feature. Some legacy folders are named `Entites`; do not rename folders as part of unrelated work.

### Application

`Budgets.Application` contains application services, DTOs/models, service interfaces, and use-case orchestration grouped by feature.

Current examples:

```txt
Budgets.Application/
  Cliente/
    Interfaces/
    Models/
    Services/
  Produto/
    Interfaces/
    Models/
    Services/
  Auth/
    Interfaces/
    Models/
    Services/
```

Application rules:

- Use Application Services as the main orchestration pattern.
- Application Services may depend on service interfaces, Domain repository interfaces, `IUnitOfWork`, validators/helpers, shared result types, and domain objects.
- Application must not depend on concrete Infrastructure implementations.
- DTOs/models and service contracts should stay inside the feature folders already used by the project.
- Do not add Command Handlers, Query Handlers, MediatR handlers, or CQRS handler classes to the current architecture unless the architecture is explicitly changed first.

### Infrastructure

`Budgets.Infrastructure` contains EF Core persistence, entity configurations, repository implementations, unit of work, migrations, and technical integrations.

Current structure:

```txt
Budgets.Infrastructure/
  Configurations/
  Context/
  Migrations/
  Repositories/
    Abstract/
  Security/
  UnitOfWork/
```

Infrastructure rules:

- The backend currently uses SQL Server through Entity Framework Core.
- `BudgetsDbContext` belongs in `Budgets.Infrastructure.Context`.
- `BudgetsDbContext` uses `ApplyConfigurationsFromAssembly(...)`.
- `BudgetsDbContext` must not expose `DbSet<TEntity>` properties.
- EF Core configurations belong in `Budgets.Infrastructure/Configurations`.
- Repository implementations and repository base classes belong in `Budgets.Infrastructure/Repositories`.
- Unit of Work implementation belongs in `Budgets.Infrastructure/UnitOfWork`.
- Migrations belong in `Budgets.Infrastructure/Migrations`.
- Repositories should use `DbContext.Set<TEntity>()` internally, usually through the shared base repository.
- Avoid putting business rules inside repositories.

### Infrastructure IoC

`Budgets.Infrastructure.IoC` is responsible for dependency injection composition.

Current extension method:

```csharp
services.AddDependencyInjection(builder.Configuration);
```

IoC rules:

- Register `BudgetsDbContext`, `IUnitOfWork`, application services, and repository implementations in `Budgets.Infrastructure.IoC`.
- Keep concrete Infrastructure implementations behind Application, Domain, or Shared abstractions.
- Keep `Budgets.Api` small by delegating service and persistence registration to IoC.
- Do not register business command/query handlers or MediatR pipeline behavior in the current architecture.

## Persistence Model

The backend uses SQL Server through Entity Framework Core.

Current database registration:

```csharp
services.AddDbContext<BudgetsDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
```

Context rules:

- `BudgetsDbContext` constructor receives `DbContextOptions<BudgetsDbContext>`.
- `BudgetsDbContext` applies configurations with `ApplyConfigurationsFromAssembly(...)`.
- `BudgetsDbContext` must not expose `DbSet<TEntity>` properties.

Entity configuration rules:

- Create one `IEntityTypeConfiguration<TEntity>` per mapped entity.
- Use the table naming pattern already used by the project, such as `Cliente`, `Produto`, `UsuarioRefreshToken`, and `TemplateOrcamento`.
- Map `Id` with `ValueGeneratedNever()` for entities that follow the existing `Guid` identity pattern.
- Configure required fields, max lengths, precision, defaults, relationships, and ignored computed properties explicitly.

Repository rules:

- Repository interfaces belong in `Budgets.Domain/<Feature>/Interfaces`.
- Repository implementations belong in `Budgets.Infrastructure/Repositories`.
- Repository implementations should inherit from `Repository<TEntity>` when the base operations are enough.
- Add feature-specific repository methods only when the application layer needs them.

Unit of Work rules:

- Application Services should commit changes through `IUnitOfWork`.
- `Commit()` persists synchronously.
- `CommitAsync(...)` persists asynchronously.
- `RollbackAsync(...)` clears pending tracked changes through the EF Core change tracker.

## Development Guidelines

### Preserve the Current Structure

Do not move, rename, or flatten existing backend folders as part of ordinary feature work. New files should be added inside the folders already created for their responsibility.

Examples:

- New entity: `backend/libraries/Budgets.Domain/<Feature>/Entities` or the existing feature folder name.
- New repository interface: `backend/libraries/Budgets.Domain/<Feature>/Interfaces`.
- New application service interface: `backend/libraries/Budgets.Application/<Feature>/Interfaces`.
- New application service implementation: `backend/libraries/Budgets.Application/<Feature>/Services`.
- New application model/DTO: `backend/libraries/Budgets.Application/<Feature>/Models`.
- New EF configuration: `backend/libraries/Budgets.Infrastructure/Configurations`.
- New repository implementation: `backend/libraries/Budgets.Infrastructure/Repositories`.
- New controller: `backend/runtimes/Budgets.Api/Controllers`.

### Use Application Services

Business use cases should be implemented through Application Services, not handlers.

Expected flow:

```txt
Controller
  -> Application Service
    -> Domain repository interface
    -> Domain entity/value object
    -> Unit of Work
```

Controllers should translate HTTP requests/responses and delegate business orchestration to Application Services.

### Do Not Add Business Handlers

The current architecture intentionally avoids:

- Command classes.
- Query classes.
- Command handlers.
- Query handlers.
- MediatR pipeline behavior.

The runtime may still contain technical handlers such as `GlobalExceptionHandler`; this does not change the application architecture.

If a future requirement introduces CQRS or MediatR, discuss and document the architecture change before implementation.

### Keep DbSet Out of DbContext

Do not add properties like:

```csharp
public DbSet<User> Users { get; set; }
```

Use repository methods backed by:

```csharp
context.Set<TEntity>()
```

This keeps persistence access centralized in repositories and avoids leaking entity sets through the context.

### Add Features Gradually

For a full backend feature, implement in this order:

1. Domain entity/value object/enum.
2. Domain repository interface.
3. EF Core configuration.
4. Repository implementation.
5. Application model/DTO.
6. Application service interface.
7. Application service implementation.
8. IoC registration.
9. Controller endpoint.
10. Tests when behavior or risk justifies coverage.
11. Migration only when requested or when schema changes are ready to be persisted.

For structural-only requests, such as "create repository, interfaces, configurations", do only the requested lower-layer files and IoC registration.

## Validation Checklist

Before finishing backend structural changes, run:

```powershell
dotnet restore Budgets.sln
dotnet build Budgets.sln --no-restore
```

If the API is running in Visual Studio and build outputs are locked, validate with an alternate output path:

```powershell
dotnet build backend/runtimes/Budgets.Api/Budgets.Api.csproj -p:BaseOutputPath=C:\Projects\BudgetManagementPlatform\.tmp\build-verify\
```

Also verify:

- No `DbSet` properties were added to `BudgetsDbContext`.
- No business Command Handlers or Query Handlers were created.
- No MediatR dependency was introduced.
- `Budgets.Api` still delegates dependency registration to `Budgets.Infrastructure.IoC`.
- New files remain inside the current folder structure.
- Repository interfaces remain in Domain, not Infrastructure.
- Repository implementations remain in Infrastructure, not Application.

## Current Architectural Defaults

- Target framework: `.NET 10`.
- Database: SQL Server.
- EF Core provider: `Microsoft.EntityFrameworkCore.SqlServer`.
- Connection string name: `DefaultConnection`.
- Entity identifier: `Guid`.
- Runtime API: `Budgets.Api`.
- Composition root: `Budgets.Infrastructure.IoC`.
- Dependency injection extension: `AddDependencyInjection(...)`.
- Business orchestration: Application Services.
- Repository abstractions: Domain interfaces.
- Repository implementations: Infrastructure classes.
- DbContext exposure: no `DbSet<TEntity>` properties.
