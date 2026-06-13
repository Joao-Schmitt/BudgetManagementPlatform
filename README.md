# Budget Management System

Sistema de gestão e geração de orçamentos desenvolvido com .NET 10 e Angular, seguindo os princípios de Domain-Driven Design (DDD), Clean Architecture e boas práticas de engenharia de software.

## Visão Geral

O Budget Management foi projetado para auxiliar empresas na criação, gerenciamento e compartilhamento de orçamentos de forma simples, segura e escalável.

O projeto tem como objetivo servir como referência de arquitetura corporativa moderna, priorizando manutenibilidade, segurança, organização do código e facilidade de evolução.

---

# Funcionalidades

## Autenticação e Segurança

* Autenticação baseada em Cookies HttpOnly
* Refresh Token
* Autenticação em Dois Fatores (2FA)
* Compatível com Google Authenticator, Microsoft Authenticator e aplicativos TOTP
* Controle de acesso baseado em Claims
* Gerenciamento de permissões por usuário
* Gerenciamento seguro de sessões
* Proteção contra CSRF
* Proteção contra Session Hijacking

## Gestão de Orçamentos

* Cadastro de clientes
* Cadastro de produtos
* Cadastro de serviços
* Cadastro de vendedores
* Cadastro de formas de pagamento
* Criação de orçamentos
* Exportação e Compartilhamento de orçamentos

## Administração

* Gerenciamento de usuários
* Gerenciamento de estabelecimentos (filiais)
* Configuração de permissões
* Configuração de comissões
* Configurações gerais do sistema
* Configuração de layouts de orçamento
* Auditoria de operações

---

# Tecnologias Utilizadas

## Backend

* .NET 10
* ASP.NET Core
* Entity Framework Core
* SQL Server
* PostgreSQL
* REST APIs

## Frontend

* Angular
* ReactNative (mobile)

## Arquitetura

* Domain-Driven Design (DDD)
* Clean Architecture
* SOLID
* Repository Pattern
* Dependency Injection
* Separation of Concerns

## Segurança

* Cookie Authentication
* Multi-Factor Authentication (MFA)
* Claims-Based Authorization
* Armazenamento seguro de senhas
* Proteção de sessão

---
## Princípios de Desenvolvimento

Este projeto segue os seguintes princípios:

* Código limpo (Clean Code)
* Arquitetura em camadas
* Baixo acoplamento
* Alta coesão
* SOLID
* DDD
* Segurança em primeiro lugar
* Facilidade de manutenção
* Escalabilidade

---

# Desenvolvimento Assistido por Inteligência Artificial

Ferramentas de Inteligência Artificial são utilizadas para acelerar atividades de desenvolvimento, tais como:

* Geração de código repetitivo
* Criação de documentação
* Sugestões de refatoração
* Automação de tarefas operacionais

Todo código gerado por IA é revisado manualmente antes de ser incorporado ao projeto.

As decisões relacionadas à arquitetura, segurança, modelagem de domínio e regras de negócio permanecem sob responsabilidade humana, garantindo qualidade, consistência e aderência às boas práticas de desenvolvimento corporativo.

---

## Estrutura do repositório

```txt
ERP/
├─ backend/
│  ├─ libraries/
│  ├─ runtimes/
│  └─ tests/
├─ frontend/
│  ├─ web-angular/
│  ├─ mobile-apps/
│  ├─ shared/
│  └─ design-system/
├─ resources/
├─ database/
├─ infra/
├─ docs/
└─ tools/

---

# Autor

Desenvolvido por João Schmitt.

Desenvolvedor Backend .NET com foco em arquitetura de software, APIs corporativas, segurança, integrações e sistemas de gestão empresarial.

