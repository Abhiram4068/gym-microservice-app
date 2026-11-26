# GEMINI.md — Gym Membership Automation Platform (GymFlow)

> **Purpose:** This file is the engineering constitution and working plan for the **Gym Membership Automation Platform (GMAP)**. Every contributor and AI assistant working in this repository must follow the architecture, code quality, reusability, security, and delivery standards defined here, aligned with [`docs/Gym_Membership_Automation_Platform_SRS.md`](docs/Gym_Membership_Automation_Platform_SRS.md).

---

## 1. Project Overview & Target Architecture

GMAP is a **multi-tenant, event-driven SaaS platform** that automates gym operations: tenant onboarding, staff access control, member registration, membership lifecycle, invoicing & payments, automated notifications, and owner operational reporting.

### Technology Stack
| Layer | Target / SRS Baseline | Current Repo Reality |
| :--- | :--- | :--- |
| **Backend Runtime** | .NET 10 / ASP.NET Core (C# 14) | .NET 10 (`net10.0`) |
| **ORM & Database** | EF Core 10 + PostgreSQL (Npgsql) | EF Core 10 + **SQL Server** in `Identity` *(see §6)* |
| **API Gateway** | YARP | `GymPlatform.Gateway` scaffolded (not yet configured) |
| **Messaging & Outbox** | RabbitMQ + MassTransit + EF Core Outbox | Not yet wired |
| **Frontend** | React + TypeScript | React 19 + Vite 8 + Tailwind CSS (**JSX** *(see §6)*) |
| **Auth & Validation** | JWT Bearer + ASP.NET Core Identity + FluentValidation | Custom `User` + `PasswordHasher` + JWT + Refresh Token rotation + FluentValidation |
| **Observability** | Serilog + OpenTelemetry + Correlation IDs + Health Checks | Standard `ILogger` |
| **Payments & Messaging** | Razorpay (test mode) + `IMessageSender` (Fake → WhatsApp Cloud API) | Not yet implemented |

### Service Boundaries (Database-per-Service)
1. **`GymPlatform.Gateway`** — YARP reverse proxy. Routes external HTTPS/HTTP traffic, forwards correlation IDs, applies rate limits/CORS. **Zero** business logic, **zero** database access, **never** consumes RabbitMQ events.
2. **`Identity`** — Authentication, JWT + refresh token rotation, SuperAdmin tenant approval/rejection, GymOwner & staff (`Receptionist`, `Trainer`) management, gym profile.
3. **`Members`** — `Member` profile records, `Membership` time-bounded entitlements (strictly separate from `Member`), renewal, expiry scanning (`MembershipExpiringSoonV1`), and membership activation upon verified payment (`PaymentCapturedV1`).
4. **`Billing`** — Membership plans/pricing catalogue, `Invoice` & `InvoiceLine` (preserving plan/price snapshots), `Payment`, Razorpay order creation, raw-body webhook signature verification, idempotent `WebhookReceipt`, publishing `PaymentCapturedV1`.
5. **`Notifications`** — Event-driven outbound messaging behind `IMessageSender` (Fake/Console sender for dev, WhatsApp Cloud API adapter for prod), `Notification` & `NotificationAttempt` persistence, deduplication by business key.
6. **`Reporting`** — CQRS read-model projections (`MemberCountByStatus`, `DailyTenantSummary`, etc.) populated solely by consuming integration events. Never queries other services' databases.
7. **`BuildingBlocks/`**:
   - `GymPlatform.Common` — Shared cross-cutting primitives (`ApiResponse<T>`, `PagedResult<T>`, result/error types, tenant/user claim helpers, pagination/sorting helpers, middleware). **Never** put service-specific domain entities here.
   - `GymPlatform.Contracts` — Immutable, versioned integration event/command contracts (`*V1`). **Never** reference EF entities or service implementations.

---

## 2. Current Implementation Snapshot

### Implemented
- **Solution & Scaffolding**: `GymPlatform.sln` / `GymPlatform.slnx` with all 5 service projects (`.Api`, `.Application`, `.Domain`, `.Infrastructure`), `GymPlatform.Gateway`, `GymPlatform.Common`, and `GymPlatform.Contracts`.
- **`GymPlatform.Common`**: `ApiResponse<T>` and `PagedResult<T>`.
- **`Identity` Service** (Clean Architecture):
  - **Domain**: `Gym`, `User` (`GymId` nullable for `SuperAdmin`), `RefreshToken`, `UserRole`, `UserStatus`.
  - **Infrastructure**: `IdentityDbContext`, entity configurations, migrations (`InitialIdentityCreate`, `AddGym`, `EditGymUsers`), `DbInitializer` (seeds SuperAdmin in Development), `JwtTokenGenerator`, `PasswordHasher`, repositories (`GymRepository`, `UserRepository`, `RefreshTokenRepository`).
  - **Application**: `AuthService`, `GymRegistrationService`, `GymOwnerService`, `UserService`, DTOs, and `FluentValidation` validators.
  - **API**:
    - `AuthController` (`/api/auth`): `admin-login`, `gym-login`, `refresh` (with refresh token rotation).
    - `UserController` (`/api/user`): `gym-register`, SuperAdmin gym owner listing/details/approve/reject (`/api/user/gymowners...`), and tenant-scoped GymOwner receptionist CRUD/status/soft-delete (`/api/user/receptionist`, `/api/user/receptionists...`, `/api/user/{id}/status`, `/api/user/{id}`).
- **`frontend/`**:
  - `axiosClient.js` (fetch-based client with automatic 401 refresh-token rotation using single-flight `refreshPromise`, Vite proxy `/api` → `http://localhost:5256`).
  - Role-protected routing (`SuperAdminRoute`, `GymOwnerRoute`) and layouts (`SuperAdminLayout`, `GymOwnerLayout`).
  - Pages: `SuperAdminLogin`, `GymLogin`, `GymOwnerRegister`, SuperAdmin (`Dashboard`, `ViewOwners`, `OwnerDetails`), GymOwner (`GymOwnerDashboard`, `ManageReceptionists`, `AddReceptionist`, `ViewReceptionistModal`).

### Not Yet Implemented (Scaffolded / Pending)
- `GymPlatform.Gateway` (still template `Hello World`).
- `Identity` gaps: `Trainer` creation/management, GymOwner profile/settings (`TimezoneId`, `CurrencyCode`, notification preferences), `/api/v1/` route standardization.
- `GymPlatform.Contracts` (event contracts).
- `Members`, `Billing`, `Notifications`, `Reporting` services (all layers contain only template `Class1.cs` / `Program.cs`).
- RabbitMQ + MassTransit + EF Core Transactional Outbox + Idempotent Consumers.
- `docker-compose.yml`, Serilog, OpenTelemetry, `/health/live` & `/health/ready`, automated tests (`UnitTests`, `IntegrationTests`, `ArchitectureTests`), and GitHub Actions CI/CD.

---

## 3. Code Reusability, Clean Code & Engineering Standards

All new code and refactors must adhere to these non-negotiable standards:

### 3.1 Clean Architecture & Dependency Rules
- **Dependency direction**: `Api` → `Application` → `Domain` ← `Infrastructure`.
- **`Domain`**: Pure C#. Zero dependencies on EF Core, ASP.NET Core, MassTransit, or external SDKs. Enforce business invariants and state transitions (e.g., `Membership.Activate()`, `Invoice.MarkPaid()`) inside domain entities/aggregates rather than anemic setters in services.
- **`Application`**: Use-case orchestration, DTOs, `FluentValidation` validators, repository/adapter interfaces. No raw `DbContext` or HTTP types (`HttpContext`, `IActionResult`).
- **`Infrastructure`**: EF Core `DbContext`, entity configurations (`IEntityTypeConfiguration<T>`), repository implementations, external adapters (Razorpay, WhatsApp, JWT).
- **`Api`**: Thin controllers only. Delegate immediately to Application services, pass `CancellationToken` through every async call, and return consistent HTTP responses.

### 3.2 Code Reusability & DRY Principles
- **Extract shared cross-service infrastructure into `GymPlatform.Common`**:
  - Move duplicated controller claim helpers (e.g., `TryGetGymId`, `GetCurrentUserId`) into a shared `ClaimsPrincipalExtensions` class in `GymPlatform.Common` before adding controllers to `Members`, `Billing`, or `Reporting`.
  - Standardize service-to-controller error mapping using typed result/error codes (e.g., `ErrorType.Validation`, `ErrorType.NotFound`, `ErrorType.Conflict`, `ErrorType.Unauthorized`) rather than matching magic strings like `result.Message == "Validation failed."` or `.Contains("not found")` in controllers.
  - Centralize global exception handling (`IExceptionHandler` / RFC 9457 `ProblemDetails`), correlation ID middleware, and pagination/sorting query extensions in `GymPlatform.Common`.
- **Extract shared messaging setup into `GymPlatform.Messaging` (or `BuildingBlocks`)**:
  - Configure MassTransit, RabbitMQ connection, retry/exponential backoff, dead-letter/error queue conventions, correlation ID filters, and transactional Outbox registration in reusable extension methods so each microservice configures messaging in a few lines without copy-pasting.
- **Reuse existing helpers & frontend primitives**:
  - Frontend: Route all HTTP calls through `frontend/src/api/axiosClient.js` and domain API modules (`src/api/*.js`). Reuse shared UI primitives (`components/common/Toast.jsx`, modals, tables, pagination, form field components) and role/status constants (`src/utils/tokenStorage.js`, `src/types/entities.js`) instead of duplicating fetch logic, status badges, or form validation.

### 3.3 Clean Code Practices
- **Small, single-purpose functions**: Keep methods focused with shallow nesting and early returns. Split long service methods into well-named private helpers.
- **Uniform variant handling**: Use mappings, dictionaries, or strategy/adapter interfaces (e.g., `IMessageSender`, `IPaymentGateway`) instead of sprawling `if/else` or `switch` chains.
- **Immutability & precision**:
  - Use `record` types for DTOs and integration events (`GymPlatform.Contracts`).
  - Always use `decimal` for monetary amounts with explicit `Currency` (e.g., `"INR"`), never `float` or `double`.
  - Always store and transmit instants in **UTC** (`DateTime` UTC / `DateTimeOffset`); use `DateOnly` for business dates (membership start/end) and convert using the tenant's configured `TimeZoneId` (e.g., `Asia/Kolkata`) for scheduling and display.
- **No magic strings or leaked internals**: Never expose EF entities in API responses or event contracts. Never leak stack traces, SQL errors, or secrets in API responses or logs.

### 3.4 Multi-Tenant Security & Data Integrity
- **Never trust client-supplied `TenantId` / `GymId`**: Always derive tenant context from verified JWT claims (`gymId`) on HTTP requests or from the event payload in message consumers (and validate it).
- **Defense in depth**: Apply EF Core global query filters on `TenantId`/`GymId` **and** explicit tenant predicates in repositories/services **and** tenant-scoped unique indexes.
- **Cross-service references**: Store foreign service IDs as `Guid` values only—never database foreign keys across service databases.
- **Preserve financial & membership history**: Never overwrite historical `Membership` records on renewal, and never cascade-delete `Invoice`/`Payment` history when a member is deactivated.

### 3.5 Event-Driven Reliability
- **Transactional Outbox**: Critical events (`MemberRegisteredV1`, `PaymentCapturedV1`, `MembershipExpiringSoonV1`) must be committed in the same database transaction as the business state change using MassTransit's EF Core Outbox.
- **Idempotent Consumers**: Every consumer must persist a processed-message/idempotency key atomically with its business update so duplicate RabbitMQ deliveries produce zero duplicate side effects.
- **Payment Truthfulness**: Never activate a membership from a client-side redirect. Activate only after `Billing` verifies the Razorpay webhook HMAC signature against the **raw request body**, matches invoice/order/amount/currency, and commits `PaymentCapturedV1`.

---

## 4. Phased Implementation Plan

Following the SRS roadmap and current repo state, work proceeds in vertical slices:

### Phase 1 — Foundation Hardening, Identity Completion & YARP Gateway
- [x] **Shared Primitives (`GymPlatform.Common`)**: `ClaimsPrincipalExtensions`, `PaginationHelper`, and typed `ErrorType` / `ApiResponse<T>` mapping implemented; *(pending: global `ProblemDetails` exception handler and Correlation ID middleware)*.
- [ ] **Identity Enhancements**: Add `Trainer` creation/listing/status management, `Gym` profile settings (`TimeZoneId`, `CurrencyCode`, notification preferences), and align routes toward `/api/v1/...` (or clean YARP path transforms).
- [ ] **YARP API Gateway (`GymPlatform.Gateway`)**: Configure YARP routes, CORS, rate limiting on auth/webhook endpoints, and correlation ID forwarding. Point frontend `/api` proxy to Gateway.
- [ ] **Local Infra & RabbitMQ (No-Docker Options)**: Configure RabbitMQ without Docker using either **CloudAMQP** (free "Little Lemur" hosted tier) or a **native Windows install** (`Erlang.ErlangOTP` + `RabbitMQ.RabbitMQServer` with `rabbitmq_management` UI), or `docker-compose.yml` where permitted. Store DB, JWT, and RabbitMQ connection strings per service via `dotnet user-secrets` (no secrets committed).

### Phase 2 — Contracts, `Members` Service & Outbox
- [ ] **`GymPlatform.Contracts`**: Define immutable `MemberRegisteredV1`, `MembershipExpiringSoonV1`, and `PaymentCapturedV1`.
- [ ] **`Members` Service**: Implement `Member` and `Membership` (separate entities, explicit state machine: `PendingPayment` → `Active` → `Expired` / `Cancelled`), tenant-scoped search/pagination, renewal without overwriting history.
- [ ] **Messaging & Outbox**: Configure MassTransit + RabbitMQ + EF Core Transactional Outbox; publish `MemberRegisteredV1` on registration.

### Phase 3 — `Billing` Service & Razorpay Integration
- [ ] **`Billing` Service**: Implement `MembershipPlan` (duration value/unit, price, currency, active flag), `Invoice` + `InvoiceLine` (preserving plan/price snapshot), `Payment`, and `WebhookReceipt`.
- [ ] **Razorpay Flow**: Test-mode order creation (`POST /api/v1/payments/checkout`), raw-body HMAC webhook verification (`POST /api/v1/webhooks/razorpay`), idempotent duplicate handling, and `PaymentCapturedV1` Outbox publication.
- [ ] **Cross-Service Activation**: Implement `PaymentCapturedConsumer` in `Members` to validate tenant/membership/payment and activate the entitlement.

### Phase 4 — `Notifications` Service & Expiry Automation
- [ ] **`Notifications` Service**: Implement `Notification`, `NotificationAttempt`, `IMessageSender` abstraction, `FakeMessageSender` (dev/console), and `WhatsAppCloudMessageSender` adapter behind config.
- [ ] **Consumers**: Idempotent consumers for `MemberRegisteredV1` (welcome), `PaymentCapturedV1` (receipt), `MembershipExpiringSoonV1` (reminder), and daily owner report.
- [ ] **Expiry Automation**: `BackgroundService` in `Members` evaluating each tenant's local timezone (e.g., 09:00 `Asia/Kolkata`) to detect memberships expiring in 2 days and publish `MembershipExpiringSoonV1` idempotently.

### Phase 5 — `Reporting` Service & Frontend Portals
- [ ] **`Reporting` Service**: Separate read-model DB + idempotent event consumers maintaining active/expired/pending-payment counts and daily owner summaries; expose `/api/v1/reports/*`.
- [ ] **Frontend Portals**:
  - **Receptionist Portal**: Register member, search/list/detail, select plan, initiate payment/renewal, view payment/invoice status.
  - **Gym Owner Portal**: Plans management, Trainer management, Gym profile/timezone settings, Reports dashboard.
  - **Trainer Portal**: Dashboard, profile, permitted member view.

### Phase 6 — Observability, Testing & CI/CD
- [ ] **Observability**: Serilog structured logging (redacting secrets/PII), OpenTelemetry tracing across HTTP + MassTransit, `/health/live` and `/health/ready` checks.
- [ ] **Testing Suite (`tests/`)**:
  - Unit tests: Membership date/timezone math, state transitions, invoice calculations, idempotency decisions.
  - Integration tests: EF tenant filters, Outbox + RabbitMQ delivery & consumer recovery, Razorpay webhook signature + duplicate replay.
  - Security & Architecture tests: Cross-tenant isolation, role escalation prevention, Clean Architecture dependency checks.
- [ ] **CI/CD**: `.github/workflows/` pipeline for `dotnet build`/`test`, `frontend` lint/build, and dependency vulnerability checks.

---

## 5. Verification & Definition of Done

Before considering any feature or PR complete:
1. **Backend**: `dotnet build GymPlatform.slnx` succeeds with zero new warnings; `dotnet test` passes all unit/integration tests.
2. **Frontend**: `npm run lint` and `npm run build` inside `frontend/` succeed cleanly.
3. **Tenant Isolation**: Every new endpoint and query is verified to derive `GymId`/`TenantId` from authenticated claims and reject cross-tenant access.
4. **No Secrets**: Verify no connection strings, JWT keys, Razorpay secrets, or WhatsApp tokens are hardcoded or committed.

---

## 6. Architecture Decisions & Open Divergences to Resolve

1. **Database Provider (SQL Server vs. PostgreSQL)**: `Identity` currently uses SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`), whereas the SRS specifies PostgreSQL (`Npgsql`). Decide whether to standardize all services on PostgreSQL (per SRS + Docker Compose) or document SQL Server as an intentional deviation.
2. **Frontend Language (JSX vs. TypeScript)**: `frontend/` is currently JavaScript/JSX. Decide whether to migrate to TypeScript incrementally (`.tsx`/`.ts`) for type-safe API contracts or enforce strict JSDoc + ESLint rules.
3. **API Versioning & Gateway Paths**: `Identity` currently exposes `/api/auth/*` and `/api/user/*`, while the SRS specifies `/api/v1/...`. Standardize route prefixes when wiring `GymPlatform.Gateway`.
