# Software Requirements Specification (SRS)

## Gym Membership Automation Platform

### Multi-Tenant, Event-Driven SaaS Platform

  Document attribute      Value
  ----------------------- ----------------------------------------------------
  Document type           Software Requirements Specification
  Project name            Gym Membership Automation Platform
  Document version        1.0
  Status                  Baseline / Proposed
  Prepared for            Product, Engineering, QA, and Project Stakeholders
  Target implementation   4--5 week MVP
  Primary backend         ASP.NET Core / .NET 10
  Frontend                React + TypeScript
  Messaging               RabbitMQ + MassTransit
  Primary database        PostgreSQL
  API Gateway             YARP
  Payment provider        Razorpay
  Messaging provider      WhatsApp Business Cloud API
  Last updated            23 November 2026

------------------------------------------------------------------------

# Document Control

## 1. Purpose

This Software Requirements Specification defines the functional,
technical, operational, and quality requirements for the Gym Membership
Automation Platform (GMAP).

The platform is a multi-tenant SaaS product intended to help independent
gyms and fitness centres manage member registration, membership plans,
renewals, payments, staff access, attendance records, automated
notifications, and operational reporting.

The system replaces fragmented paper registers, spreadsheets, and
manually initiated WhatsApp messages with a centralized application and
event-driven automation.

This document establishes a common baseline for implementation, testing,
demonstration, and future product development. It is intended for:

-   Product owners and business stakeholders.
-   Backend and frontend engineers.
-   Software architects.
-   QA and test engineers.
-   DevOps and deployment engineers.
-   Reviewers, interviewers, and technical evaluators.

## 2. Product Vision

Provide small and medium-sized gyms with an affordable, reliable, and
easy-to-operate platform that automates routine membership
administration and improves visibility into gym operations.

The product should allow a gym to register a member once and
automatically coordinate the relevant downstream activities: invoice
creation, payment tracking, notifications, and reporting.

## 3. Business Problem

Many independent gyms manage operations through paper diaries,
spreadsheets, messaging applications, and manual payment records. This
creates recurring problems:

1.  Member information is duplicated or difficult to retrieve.
2.  Membership expiry dates are not consistently tracked.
3.  Renewal reminders depend on staff remembering to send them.
4.  Owners do not have a reliable daily view of active, expired, and
    payment-pending memberships.
5.  Payment records may not be reflected consistently across operational
    records.
6.  Staff access is informal and difficult to audit.
7.  A single spreadsheet or employee may become a single point of
    failure.
8.  As a gym grows, manual administration becomes increasingly
    time-consuming.

## 4. Product Objectives

The platform shall:

-   Centralize gym, staff, member, membership, plan, invoice, and
    payment information.
-   Automate membership expiry reminders.
-   Automate welcome and payment confirmation messages.
-   Provide owners with daily operational summaries.
-   Support multiple gyms on one SaaS platform with strict tenant
    isolation.
-   Process independent business activities asynchronously through
    RabbitMQ.
-   Preserve business records when downstream services or external
    providers are temporarily unavailable.
-   Provide a foundation for future attendance, trainer, inventory, and
    member self-service capabilities.

## 5. Success Measures

The MVP will be considered successful when it can demonstrate:

  -----------------------------------------------------------------------
  Measure                             MVP success condition
  ----------------------------------- -----------------------------------
  Member registration                 A receptionist can register a
                                      member and retrieve the saved
                                      record

  Tenant isolation                    A user from one gym cannot access
                                      another gym's records

  Event publishing                    Member registration produces a
                                      durable integration event

  Asynchronous processing             Billing, Notifications, and
                                      Reporting process events
                                      independently

  Payment processing                  A verified payment webhook updates
                                      payment state exactly once from the
                                      business perspective

  Expiry automation                   Eligible memberships are detected
                                      and reminder events are generated

  Owner reporting                     Owner can view active, expired, and
                                      pending-payment counts

  Failure recovery                    A stopped consumer processes queued
                                      messages after recovery

  Traceability                        A request/event can be followed
                                      using correlation identifiers

  Deployment                          The application can be deployed
                                      using documented configuration and
                                      CI/CD steps
  -----------------------------------------------------------------------

Numeric performance targets must be validated against the actual
deployment environment and agreed before production launch.

------------------------------------------------------------------------

# 6. Scope

## 6.1 In Scope --- MVP

### SaaS platform administration

-   Super Admin authentication.
-   Gym tenant creation and management.
-   Initial Gym Owner provisioning.
-   Tenant activation and deactivation.
-   Basic platform-level tenant overview.

### Gym administration

-   Gym Owner authentication.
-   Gym profile management.
-   Staff account creation and management.
-   Role-based access control.
-   Gym-level operational dashboard.

### Staff operations

-   Receptionist account creation by Gym Owner.
-   Trainer account creation by Gym Owner.
-   Member registration and search.
-   Membership plan selection.
-   Membership start and expiry date management.
-   Payment status visibility.
-   Membership renewal and expiry handling.

### Billing

-   Gym membership plans and prices.
-   Invoice creation.
-   Payment initiation or recording.
-   Razorpay integration in test mode.
-   Razorpay webhook signature verification.
-   Payment confirmation and receipt event.

### Notifications

-   Welcome notification.
-   Membership expiry reminder.
-   Payment receipt/confirmation.
-   Membership expiry notification.
-   Daily owner report.
-   Fake/console sender for development.
-   WhatsApp Cloud API adapter for later integration.

### Reporting

-   Active member count.
-   Expired member count.
-   Pending payment count.
-   Daily owner summary.
-   Basic dashboard read model.

### Platform engineering

-   YARP API Gateway.
-   RabbitMQ and MassTransit.
-   Transactional Outbox.
-   Idempotent consumers.
-   Retry and dead-letter/error handling.
-   Structured logging.
-   Correlation IDs and distributed tracing.
-   Automated tests and CI pipeline.
-   Containerized local development where permitted.

## 6.2 Out of Scope --- MVP

The following features are explicitly deferred:

-   Native Android or iOS applications.
-   Biometric or face-recognition attendance.
-   Hardware turnstile integration.
-   Payroll and trainer commission calculation.
-   Diet plans and workout-plan management.
-   Inventory and point-of-sale management.
-   Multi-branch franchise hierarchy.
-   Advanced accounting and tax filing.
-   Automated refunds and complex dispute workflows.
-   AI-generated personalized messages.
-   Kafka-based event streaming.
-   Advanced data warehouse and business intelligence.
-   Full customer/member self-service portal.
-   Automated recurring card or UPI mandates.
-   Guaranteed WhatsApp delivery when the provider rejects or cannot
    deliver a message.

These may be considered after the MVP has demonstrated a stable core
workflow.

## 6.3 Future Scope

-   Member portal and self-service renewal.
-   Attendance management.
-   Trainer assignments and workout tracking.
-   Multi-branch gym support.
-   Loyalty and referral programmes.
-   Promotional campaigns.
-   Inventory and supplement sales.
-   Advanced revenue analytics.
-   AI-assisted message personalization.
-   Additional payment providers.
-   Mobile applications.
-   Kafka for high-volume analytical/event-streaming use cases, if
    justified by scale.

------------------------------------------------------------------------

# 7. Stakeholders and User Classes

## 7.1 Stakeholders

  -----------------------------------------------------------------------
  Stakeholder                         Interest
  ----------------------------------- -----------------------------------
  SaaS Platform Owner                 Operates the overall platform and
                                      manages gym tenants

  Gym Owner                           Runs a gym and manages its staff,
                                      members, plans, and reports

  Receptionist                        Performs front-desk registration
                                      and membership operations

  Trainer                             Works with assigned gym members
                                      and, in future, attendance/training
                                      data

  Gym Member                          Purchases and uses a gym membership

  Payment Provider                    Processes payment transactions

  WhatsApp Provider                   Delivers approved business messages

  Engineering / Operations            Develops, deploys, monitors, and
                                      supports the platform
  -----------------------------------------------------------------------

## 7.2 User Roles

The platform has four administrative/staff account roles and one
customer persona.

### 7.2.1 Super Admin

The Super Admin operates the SaaS platform.

Responsibilities: - Authenticate through the platform administration
interface. - Create and manage gym tenants. - Provision the first Gym
Owner account for a tenant. - Activate, suspend, or deactivate a
tenant. - View platform-level tenant statistics. - Review basic platform
activity and operational status.

Restrictions: - Super Admin actions must be audited. - Super Admin must
not be assigned to a gym tenant as an ordinary staff member. - Tenant
access must be explicit and controlled; platform administration must not
imply unrestricted access to all customer data.

### 7.2.2 Gym Owner

The Gym Owner is the administrator of one gym tenant.

Responsibilities: - Manage gym profile and operational settings. -
Create Receptionist and Trainer accounts. - Activate or deactivate staff
accounts. - Create and manage gym membership plans, subject to the
product's billing model. - View member, membership, invoice, and payment
information. - View daily operational reports. - Configure notification
preferences and the owner's report destination. - Review staff activity.

Restrictions: - A Gym Owner may only manage data belonging to their
tenant. - A Gym Owner cannot create a Super Admin. - A Gym Owner cannot
assign users to another tenant. - A Gym Owner cannot change their own
role through ordinary profile endpoints.

### 7.2.3 Receptionist

The Receptionist performs front-desk operations.

Responsibilities: - Register new members. - Search and view permitted
member records. - Select an available membership plan. - Record or
initiate a membership purchase. - View invoice and payment status. -
Initiate a renewal. - Correct permitted member contact details. - View
membership expiry information.

Restrictions: - Cannot manage tenants. - Cannot create or promote staff
accounts. - Cannot change gym-level security settings. - Cannot access
platform-wide reports. - Cannot view or modify another tenant's data.

### 7.2.4 Trainer

The Trainer supports gym operations.

MVP responsibilities: - Sign in securely. - View their own profile. -
View permitted member details if the gym enables this access. - View
membership validity for assigned members where applicable.

Future responsibilities: - Mark attendance. - View training schedules. -
Manage assigned workout plans. - Track fitness progress.

Restrictions: - Cannot manage billing or staff. - Cannot change
membership prices. - Cannot access unrelated members unless authorized
by gym policy.

### 7.2.5 Gym Member

A Gym Member is the customer who purchases a gym membership. A member is
a business record, not automatically an authenticated platform user.

MVP capabilities: - Be registered by a Receptionist. - Receive welcome,
expiry, and payment messages. - Have membership and payment records
maintained by the gym.

Future member-portal capabilities: - Sign in to view membership
details. - View invoices and payment history. - Download receipts. -
Renew a membership. - View attendance history. - Manage communication
preferences where legally and operationally appropriate.

A member login account is optional and must be linked to the
corresponding Member record if introduced.

## 7.3 User Creation Hierarchy

1.  Super Admin creates a Gym tenant and provisions its initial Gym
    Owner.
2.  Gym Owner signs in and creates Receptionist and Trainer accounts.
3.  Receptionist registers Gym Member records.
4.  Gym Members do not need login credentials in the MVP.

------------------------------------------------------------------------

# 8. Assumptions, Dependencies, and Constraints

## 8.1 Assumptions

-   Each gym is represented by a tenant.
-   A tenant initially represents one gym business; multi-branch support
    is deferred.
-   Each tenant has at least one Gym Owner.
-   Gym members may be registered without a login account.
-   The gym is responsible for the accuracy and lawful collection of
    member contact information.
-   The initial payment integration uses Razorpay test mode.
-   WhatsApp integration initially uses a fake sender.
-   PostgreSQL is the preferred database for the MVP.
-   All services are independently deployable, even if they are
    maintained in one repository.
-   Each service owns its data and does not directly query another
    service's database.

## 8.2 External Dependencies

-   Razorpay account and test credentials.
-   WhatsApp Business Platform account, phone number, approved
    templates, and access token for production messaging.
-   RabbitMQ broker.
-   PostgreSQL database.
-   Hosting provider and deployment credentials.
-   Email provider if email invitations are enabled.
-   OpenTelemetry-compatible collector/backend if external trace storage
    is configured.

## 8.3 Development Constraints

-   Company-managed devices may restrict Docker Desktop, package feeds,
    or external domains.
-   Development must use synthetic data only.
-   No company source code, credentials, customer records, or
    proprietary information may be used.
-   Hosted RabbitMQ may be used for development if local broker
    installation is blocked.
-   Secrets must not be committed to source control.
-   Paid client deployments and client data must be handled on an
    appropriately authorized personal or client-controlled environment.

## 8.4 Technology Baseline

  Layer                   Proposed technology
  ----------------------- -----------------------------------------------
  Runtime                 .NET 10 / ASP.NET Core
  Language                C# 14
  ORM                     Entity Framework Core 10
  Database                PostgreSQL
  Database provider       Npgsql EF Core provider
  API Gateway             YARP
  Messaging               RabbitMQ
  Messaging abstraction   MassTransit
  Frontend                React + TypeScript
  Authentication          ASP.NET Core Identity + JWT
  Validation              FluentValidation
  Logging                 Serilog
  Tracing                 OpenTelemetry
  Scheduling              BackgroundService initially
  Payment                 Razorpay
  Notification            WhatsApp Business Cloud API behind an adapter
  Tests                   xUnit, integration tests, architecture tests
  CI/CD                   GitHub Actions
  Local infrastructure    Docker Compose where available

Versions of third-party packages must be pinned to mutually compatible
stable releases at implementation time.

------------------------------------------------------------------------

# 9. System Overview and Architecture

## 9.1 Architectural Style

The platform uses: - Domain-oriented service boundaries. - Clean
Architecture within backend services. - Event-driven communication
between backend services. - Synchronous HTTP for request/response
operations. - Asynchronous messaging for independent downstream business
processes. - Database-per-service ownership. - CQRS-style read
projections in Reporting where appropriate.

The architecture is not intended to split every entity or feature into a
separate service. A service should own a distinct business capability
and its data.

## 9.2 Logical Architecture

``` text
                         React + TypeScript UI
                                  |
                                  | HTTPS
                                  v
                         YARP API Gateway
                                  |
             +--------------------+--------------------+
             |                    |                    |
             v                    v                    v
       Members API           Billing API          Identity /
                                                   Tenant APIs
             |                    |
             |                    | Razorpay webhook
             |                    v
             |               Razorpay
             |
             +--------------------+
                                  |
                            RabbitMQ Broker
                                  |
            +---------------------+----------------------+
            |                     |                      |
            v                     v                      v
       Billing Consumer     Notifications Consumer   Reporting Consumer
            |                     |                      |
            v                     v                      v
        Billing DB           Notifications DB          Reporting DB
                                  |
                                  v
                        WhatsApp / Email Provider

       Members DB              Reporting DB
            ^                       ^
            |                       |
            +----- PaymentCaptured--+
```

Identity and tenant provisioning may initially be implemented within a
dedicated Identity capability or within the Members deployment, provided
ownership is explicit. The MVP should not add a separate service solely
to increase service count. If Identity is hosted in Members initially,
keep authentication concerns isolated in its own application module and
define a future extraction boundary.

## 9.3 Deployable Components

The proposed MVP has five business services and one API Gateway:

  -----------------------------------------------------------------------
  Component               Type                    Responsibility
  ----------------------- ----------------------- -----------------------
  Gateway                 Infrastructure          Routes incoming HTTP
                          component               requests

  Identity / Tenant       Business capability     Authentication, tenant
  capability                                      provisioning, user and
                                                  role management

  Members                 Business microservice   Member and membership
                                                  lifecycle

  Billing                 Business microservice   Plans, invoices,
                                                  payment processing

  Notifications           Business microservice   Outbound communication

  Reporting               Business microservice   Read projections and
                                                  operational reports
  -----------------------------------------------------------------------

For a five-service business architecture, Identity/Tenant is counted as
a business service if deployed independently. If it is hosted within
Members for the MVP, the deployment count is four business services plus
Gateway, with a clearly isolated Identity module. The implementation
decision must be recorded before scaffolding.

## 9.4 Service Responsibilities

### Gateway

-   Route external requests to internal APIs.
-   Apply cross-cutting HTTP policies.
-   Forward correlation identifiers.
-   Configure rate limits and request size limits.
-   Avoid business logic and database access.
-   Never act as a RabbitMQ event consumer.

### Identity / Tenant

-   Authenticate users.
-   Issue access tokens.
-   Manage user accounts and roles.
-   Provision tenants and initial owners.
-   Enforce tenant membership and account status.
-   Provide tenant context to authorized services.

### Members

-   Own member records.
-   Own membership lifecycle records.
-   Register and update members.
-   Manage membership start and expiry dates.
-   Detect memberships approaching expiry.
-   Publish member and expiry events through an Outbox.

### Billing

-   Own plan, invoice, and payment records.
-   Create invoices in response to member registration or purchase
    workflows.
-   Initiate payment requests.
-   Receive and verify Razorpay webhooks.
-   Prevent duplicate payment processing.
-   Publish payment events through an Outbox.

### Notifications

-   Own notification delivery records and attempts.
-   Consume notification-relevant events.
-   Select approved message templates.
-   Send WhatsApp/email messages through provider adapters.
-   Retry transient failures.
-   Record provider responses and final outcomes.
-   Never expose provider credentials to other services.

### Reporting

-   Own its read-model database.
-   Consume integration events.
-   Maintain projections for member and payment counts.
-   Generate daily owner summaries.
-   Expose dashboard/report query APIs.
-   Avoid querying other services' databases.

## 9.5 Database Ownership

Each service owns its data. No service may directly read or write
another service's tables.

Suggested logical databases:

-   IdentityDb
-   MembersDb
-   BillingDb
-   NotificationsDb
-   ReportingDb

For local development, these may run on one PostgreSQL server/container
but should use separate databases or schemas and separate credentials
where practical. Production deployments may use separate database
instances according to isolation, cost, and operational requirements.

## 9.6 Communication Rules

  Communication                            Protocol
  ---------------------------------------- -----------------------------------------
  Browser to Gateway                       HTTPS
  Gateway to service                       HTTP/HTTPS
  Service to service for immediate query   HTTP only when necessary
  Service to service for business events   RabbitMQ
  Razorpay to Billing                      HTTPS webhook
  Notifications to WhatsApp                HTTPS provider API
  Background processing                    Hosted services / MassTransit consumers

Do not use RabbitMQ for ordinary browser-to-API request/response
traffic.

------------------------------------------------------------------------

# 10. Functional Requirements

Requirements are assigned identifiers for traceability. Priority
labels: - **P0:** Required for MVP acceptance. - **P1:** Important;
implement if the core flow is stable. - **P2:** Future enhancement.

## 10.1 Authentication and Account Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-AUTH-001             P0                      The system shall allow
                                                  authorized users to
                                                  sign in using their
                                                  registered credentials.

  FR-AUTH-002             P0                      The system shall issue
                                                  a signed JWT access
                                                  token after successful
                                                  authentication.

  FR-AUTH-003             P0                      The system shall
                                                  include user
                                                  identifier, role, and
                                                  tenant context in
                                                  authenticated claims as
                                                  appropriate.

  FR-AUTH-004             P0                      The system shall reject
                                                  inactive, suspended, or
                                                  deactivated accounts.

  FR-AUTH-005             P0                      The system shall
                                                  enforce authorization
                                                  on protected endpoints.

  FR-AUTH-006             P0                      The system shall
                                                  prevent users from
                                                  assigning themselves a
                                                  higher-privilege role.

  FR-AUTH-007             P1                      The system should
                                                  support password reset
                                                  through a verified
                                                  channel.

  FR-AUTH-008             P1                      The system should
                                                  support refresh-token
                                                  rotation if long-lived
                                                  sessions are required.

  FR-AUTH-009             P0                      The system shall record
                                                  security-relevant
                                                  authentication events.
  -----------------------------------------------------------------------

Authentication security decisions: - Store password hashes using ASP.NET
Core Identity password hashing. - Never store plaintext passwords. -
Keep JWT signing keys in secure configuration. - Use short-lived access
tokens appropriate to the threat model. - If refresh tokens are
implemented, store hashed token values, rotate them, and support
revocation. - Do not put sensitive personal information in JWT claims.

## 10.2 Tenant Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-TEN-001              P0                      Super Admin shall be
                                                  able to create a gym
                                                  tenant.

  FR-TEN-002              P0                      Tenant creation shall
                                                  provision the initial
                                                  Gym Owner account.

  FR-TEN-003              P0                      The system shall assign
                                                  a unique tenant
                                                  identifier to each gym.

  FR-TEN-004              P0                      Super Admin shall be
                                                  able to activate or
                                                  suspend a tenant.

  FR-TEN-005              P0                      A suspended tenant's
                                                  users shall not perform
                                                  normal tenant
                                                  operations.

  FR-TEN-006              P0                      Tenant-scoped
                                                  operations shall derive
                                                  tenant context from
                                                  authenticated identity,
                                                  not trust a
                                                  client-supplied
                                                  TenantId.

  FR-TEN-007              P0                      The system shall
                                                  prevent cross-tenant
                                                  data access.

  FR-TEN-008              P1                      The system should
                                                  retain an audit history
                                                  of tenant status
                                                  changes.

  FR-TEN-009              P2                      The system may support
                                                  multiple branches under
                                                  one tenant.
  -----------------------------------------------------------------------

Tenant lifecycle: 1. Super Admin creates tenant. 2. System provisions
initial owner. 3. Owner activates account. 4. Owner creates staff. 5.
Tenant operates. 6. Super Admin may suspend or reactivate tenant. 7.
Tenant data is retained or deleted according to the configured retention
and legal policy.

## 10.3 Staff Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-STAFF-001            P0                      Gym Owner shall be able
                                                  to create Receptionist
                                                  accounts.

  FR-STAFF-002            P0                      Gym Owner shall be able
                                                  to create Trainer
                                                  accounts.

  FR-STAFF-003            P0                      Staff accounts shall be
                                                  assigned to the owner's
                                                  tenant by the server.

  FR-STAFF-004            P0                      Gym Owner shall be able
                                                  to view staff belonging
                                                  to their tenant.

  FR-STAFF-005            P0                      Gym Owner shall be able
                                                  to deactivate and
                                                  reactivate staff
                                                  accounts.

  FR-STAFF-006            P0                      Staff shall not be able
                                                  to create or modify
                                                  Super Admin accounts.

  FR-STAFF-007            P1                      The system should
                                                  support
                                                  invitation-based
                                                  account activation.

  FR-STAFF-008            P1                      The system should
                                                  record staff creation
                                                  and status changes in
                                                  an audit log.
  -----------------------------------------------------------------------

The MVP may use an initial password flow, but a one-time invitation or
password setup link is preferred for production. Temporary credentials
must not be sent in an insecure plaintext channel.

## 10.4 Gym Profile and Settings

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-GYM-001              P0                      Gym Owner shall be able
                                                  to view and update
                                                  permitted gym profile
                                                  fields.

  FR-GYM-002              P0                      The gym profile shall
                                                  contain name, contact
                                                  details, address, and
                                                  timezone.

  FR-GYM-003              P1                      Owner shall configure
                                                  the daily report
                                                  recipient.

  FR-GYM-004              P1                      Owner shall configure
                                                  notification
                                                  preferences.

  FR-GYM-005              P1                      Owner shall configure
                                                  the gym's operating
                                                  currency, initially INR
                                                  for the target market.
  -----------------------------------------------------------------------

All scheduled date calculations and message timestamps must use the
tenant's configured timezone. Store timestamps in UTC and convert for
display and scheduling.

## 10.5 Membership Plan Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-PLAN-001             P0                      Authorized gym staff
                                                  shall be able to view
                                                  available membership
                                                  plans.

  FR-PLAN-002             P0                      Gym Owner shall be able
                                                  to create a plan with a
                                                  name, duration, and
                                                  price.

  FR-PLAN-003             P0                      Gym Owner shall be able
                                                  to activate or
                                                  deactivate a plan.

  FR-PLAN-004             P0                      The system shall
                                                  preserve the plan and
                                                  price snapshot used by
                                                  an issued invoice.

  FR-PLAN-005             P0                      The system shall
                                                  prevent new purchases
                                                  of inactive plans.

  FR-PLAN-006             P1                      The system should
                                                  support plan
                                                  descriptions and
                                                  optional benefits.

  FR-PLAN-007             P2                      The system may support
                                                  discounts, coupons, and
                                                  promotional pricing.
  -----------------------------------------------------------------------

A plan should define its duration in a clear unit, such as days or
calendar months. The business must define how month-end dates and leap
years are handled. Do not assume that every month equals 30 days.

## 10.6 Member Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-MEM-001              P0                      Receptionist shall be
                                                  able to register a new
                                                  gym member.

  FR-MEM-002              P0                      Member registration
                                                  shall capture the
                                                  minimum required
                                                  identity and contact
                                                  information.

  FR-MEM-003              P0                      A member shall be
                                                  associated with exactly
                                                  one tenant in the MVP.

  FR-MEM-004              P0                      The system shall
                                                  generate a unique
                                                  member identifier/code
                                                  within the defined
                                                  scope.

  FR-MEM-005              P0                      Receptionist shall be
                                                  able to search and view
                                                  permitted member
                                                  records.

  FR-MEM-006              P0                      Authorized staff shall
                                                  be able to update
                                                  permitted member
                                                  details.

  FR-MEM-007              P0                      The system shall
                                                  maintain membership
                                                  records separately from
                                                  the member's personal
                                                  profile.

  FR-MEM-008              P0                      The system shall
                                                  support membership
                                                  renewal.

  FR-MEM-009              P0                      The system shall
                                                  prevent accidental
                                                  duplicate registrations
                                                  according to configured
                                                  duplicate checks.

  FR-MEM-010              P1                      The system should
                                                  support pagination,
                                                  filtering, and sorting.

  FR-MEM-011              P1                      The system should
                                                  support CSV import with
                                                  validation and an
                                                  import summary.

  FR-MEM-012              P2                      The system may support
                                                  member self-service
                                                  accounts.
  -----------------------------------------------------------------------

Suggested member fields: - MemberId (GUID) - TenantId - MemberCode -
FullName - PhoneNumber - Email (optional) - DateOfBirth (optional;
collect only if needed) - Gender (optional; collect only if needed) -
Address (optional) - EmergencyContact (optional) - CreatedAtUtc -
UpdatedAtUtc - IsActive / lifecycle status - DeletedAtUtc if soft
deletion is adopted

Do not collect sensitive or unnecessary personal data merely because a
field is available.

## 10.7 Membership Lifecycle

A Member is a person record. A Membership is a time-bounded entitlement
to use the gym. These concepts must not be represented by one table or
one status field.

Suggested membership states: - PendingPayment - Active - Expired -
Cancelled - Suspended (only if a defined business rule requires it)

The precise state transition rules must be enforced in the Members
domain.

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-LIFE-001             P0                      The system shall create
                                                  a membership record for
                                                  a member's selected
                                                  plan.

  FR-LIFE-002             P0                      The system shall
                                                  calculate the
                                                  membership end date
                                                  using the plan duration
                                                  and gym timezone rules.

  FR-LIFE-003             P0                      The system shall track
                                                  membership start and
                                                  end dates.

  FR-LIFE-004             P0                      The system shall
                                                  support pending-payment
                                                  membership state.

  FR-LIFE-005             P0                      The system shall
                                                  activate a membership
                                                  only when the
                                                  configured
                                                  payment/approval rule
                                                  is satisfied.

  FR-LIFE-006             P0                      The system shall
                                                  support renewal without
                                                  overwriting historical
                                                  membership records.

  FR-LIFE-007             P0                      The system shall detect
                                                  memberships approaching
                                                  expiry.

  FR-LIFE-008             P0                      The system shall mark
                                                  memberships expired
                                                  according to the agreed
                                                  expiry boundary.

  FR-LIFE-009             P1                      The system should
                                                  retain membership
                                                  history for reporting
                                                  and audit purposes.
  -----------------------------------------------------------------------

Recommended MVP business rule: - Registering a member creates the member
record. - A membership purchase creates a pending membership and
invoice. - Successful verified payment causes the membership to become
active. - If the gym accepts offline payments, an authorized
Receptionist or Owner may record an offline payment through a controlled
operation, with an audit trail. - A free/trial membership may follow a
separate explicit activation rule.

Do not mark every membership active merely because a member profile was
registered.

## 10.8 Billing, Invoices, and Payments

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-BILL-001             P0                      Billing shall own
                                                  invoice and payment
                                                  records.

  FR-BILL-002             P0                      Billing shall create an
                                                  invoice for a
                                                  membership purchase
                                                  request.

  FR-BILL-003             P0                      Invoice shall preserve
                                                  the purchased plan
                                                  name, duration, and
                                                  price snapshot.

  FR-BILL-004             P0                      Billing shall support
                                                  INR amounts for the
                                                  initial market.

  FR-BILL-005             P0                      Billing shall initiate
                                                  a Razorpay test-mode
                                                  payment order where
                                                  online payment is
                                                  selected.

  FR-BILL-006             P0                      Billing shall receive
                                                  Razorpay webhooks over
                                                  HTTPS.

  FR-BILL-007             P0                      Billing shall verify
                                                  the webhook signature
                                                  using the configured
                                                  webhook secret and the
                                                  raw request body.

  FR-BILL-008             P0                      Billing shall verify
                                                  that the payment maps
                                                  to the expected
                                                  invoice/order and
                                                  amount before marking
                                                  it captured.

  FR-BILL-009             P0                      Billing shall handle
                                                  duplicate webhook
                                                  deliveries
                                                  idempotently.

  FR-BILL-010             P0                      Billing shall publish
                                                  PaymentCaptured only
                                                  after its local payment
                                                  transaction is
                                                  committed through the
                                                  Outbox.

  FR-BILL-011             P0                      Authorized staff shall
                                                  be able to view invoice
                                                  and payment status.

  FR-BILL-012             P1                      The system should
                                                  support receipt
                                                  generation.

  FR-BILL-013             P1                      The system should
                                                  support audited offline
                                                  payment recording.

  FR-BILL-014             P2                      The system may support
                                                  refunds, partial
                                                  payments, discounts,
                                                  and recurring mandates.
  -----------------------------------------------------------------------

Payment statuses: - Created - Pending - Authorized (if provider flow
requires it) - Captured - Failed - Refunded - PartiallyRefunded (future,
if supported)

Invoice statuses: - Draft - Pending - Paid - Overdue (if applicable) -
Cancelled - Refunded (subject to accounting policy)

Financial amounts must use decimal types with appropriate precision,
never floating-point types. Currency must be explicit.

A browser redirect or client-side success screen is not proof of
payment. The verified provider webhook or a trusted server-side
verification flow is authoritative.

## 10.9 Notification Management

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-NOT-001              P0                      Notifications shall
                                                  consume relevant
                                                  integration events from
                                                  RabbitMQ.

  FR-NOT-002              P0                      Notifications shall
                                                  send a welcome message
                                                  after a valid member
                                                  registration event.

  FR-NOT-003              P0                      Notifications shall
                                                  send a payment
                                                  confirmation after a
                                                  valid payment event.

  FR-NOT-004              P0                      Notifications shall
                                                  send an expiry reminder
                                                  for eligible
                                                  memberships.

  FR-NOT-005              P0                      Notifications shall
                                                  send the daily owner
                                                  report generated by
                                                  Reporting.

  FR-NOT-006              P0                      Notifications shall use
                                                  an IMessageSender
                                                  abstraction.

  FR-NOT-007              P0                      Development shall
                                                  support a fake/console
                                                  sender.

  FR-NOT-008              P1                      Production shall
                                                  support WhatsApp Cloud
                                                  API through a provider
                                                  adapter.

  FR-NOT-009              P1                      The system should
                                                  record each
                                                  notification attempt
                                                  and provider response.

  FR-NOT-010              P1                      The system should
                                                  support retry for
                                                  transient provider
                                                  errors.

  FR-NOT-011              P1                      The system should avoid
                                                  duplicate sends for the
                                                  same notification
                                                  business key.

  FR-NOT-012              P1                      The system should
                                                  support approved
                                                  template identifiers
                                                  and variables.

  FR-NOT-013              P2                      The system may support
                                                  AI-assisted message
                                                  personalization with
                                                  approved, bounded
                                                  content.
  -----------------------------------------------------------------------

Notification types: - MemberWelcome - MembershipExpiringSoon -
MembershipExpired - PaymentReceipt - DailyOwnerReport

Notification delivery statuses: - Pending - Processing -
SentToProvider - Delivered (only if provider callback confirms
delivery) - Failed - Suppressed

Do not label a message as Delivered merely because the provider accepted
the API request. Distinguish provider acceptance from final delivery
status.

WhatsApp requirements: - Use a WhatsApp Business Platform account for
production. - Use approved message templates when required by WhatsApp
policy. - Respect the applicable customer-service window and template
category rules. - Store credentials securely. - Do not send marketing
messages without appropriate consent. - Record opt-out or suppression
preferences where applicable. - Keep provider-specific logic inside the
Notifications service.

## 10.10 Expiry Automation

  ------------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- ------------------------
  FR-EXP-001              P0                      A scheduled job shall
                                                  run according to each
                                                  tenant's configured
                                                  local time.

  FR-EXP-002              P0                      The initial reminder
                                                  schedule shall identify
                                                  memberships expiring in
                                                  two days.

  FR-EXP-003              P0                      The job shall publish
                                                  MembershipExpiringSoon
                                                  through a durable event
                                                  flow.

  FR-EXP-004              P0                      The job shall not
                                                  generate duplicate
                                                  reminders for the same
                                                  membership and reminder
                                                  window.

  FR-EXP-005              P1                      The system should
                                                  support configurable
                                                  reminder windows, such
                                                  as 7 days, 2 days, and
                                                  expiry day.

  FR-EXP-006              P1                      The system should record
                                                  job execution results
                                                  and failures.
  ------------------------------------------------------------------------

The scheduler must account for tenant timezone, daylight-saving rules
where relevant, and date-boundary semantics. The target Indian
deployment will generally use Asia/Kolkata, but timezone must remain
tenant-configurable.

## 10.11 Daily Owner Reporting

  -----------------------------------------------------------------------
  ID                      Priority                Requirement
  ----------------------- ----------------------- -----------------------
  FR-REP-001              P0                      Reporting shall
                                                  maintain a local read
                                                  model using consumed
                                                  events.

  FR-REP-002              P0                      The owner dashboard
                                                  shall show active
                                                  membership count.

  FR-REP-003              P0                      The owner dashboard
                                                  shall show expired
                                                  membership count.

  FR-REP-004              P0                      The owner dashboard
                                                  shall show pending
                                                  payment count or amount
                                                  according to a defined
                                                  metric.

  FR-REP-005              P0                      Reporting shall
                                                  generate a daily owner
                                                  summary.

  FR-REP-006              P0                      The daily summary shall
                                                  be delivered through
                                                  the Notifications
                                                  service.

  FR-REP-007              P1                      The dashboard should
                                                  support date-range
                                                  filtering.

  FR-REP-008              P1                      The dashboard should
                                                  show recent
                                                  registrations and
                                                  upcoming expiries.

  FR-REP-009              P2                      The system may provide
                                                  revenue trends and
                                                  advanced analytics.
  -----------------------------------------------------------------------

Metric definitions must be documented. For example: - Active Members:
distinct members with an active membership at the report's as-of
timestamp. - Expired Members: distinct members whose latest relevant
membership has expired, if that is the selected business definition. -
Pending Payments: count or total amount of unpaid invoices; the
dashboard must label which metric it displays.

## 10.12 CSV Import

P1 feature, if time permits: - Receptionist uploads a CSV file. - System
validates required columns and data formats. - System previews valid and
invalid rows. - User confirms import. - System processes the import in a
controlled batch. - Duplicate detection runs within the tenant. - System
returns a result containing inserted, skipped, and failed row counts. -
Large imports must not block an HTTP request for the full processing
duration.

## 10.13 Audit and Activity

The system should record security- and business-relevant actions,
including: - Tenant creation and status changes. - Staff creation and
deactivation. - Member creation and updates. - Membership activation,
renewal, suspension, and cancellation. - Invoice creation and payment
status changes. - Offline payment recording. - Role and permission
changes. - Sensitive configuration changes.

Audit records should include actor, tenant, action, target entity,
timestamp, and correlation identifier. Avoid storing secrets or
unnecessary personal data in audit payloads.

------------------------------------------------------------------------

# 11. Event-Driven Integration Requirements

## 11.1 Messaging Principles

-   RabbitMQ is used for backend-to-backend asynchronous integration.
-   Each consumer has its own queue.
-   A published event is distributed to each relevant consumer queue
    using publish/subscribe topology.
-   One queue should have competing consumers only when horizontal
    scaling of the same logical consumer is intended.
-   Events represent facts that have already occurred.
-   Commands represent requests to perform work; do not name commands as
    past-tense facts.
-   Consumers must be idempotent.
-   Messages must be durable where business loss is unacceptable.
-   Consumers acknowledge only after successful processing.
-   Transient failures should be retried with bounded backoff.
-   Poison messages must be moved to an error/dead-letter path and
    observable.

## 11.2 Standard Event Envelope

Every integration event should carry common metadata. MassTransit
provides transport metadata such as message identifiers and correlation
identifiers; the application contract should still define stable
business metadata where consumers require it.

Recommended envelope fields: - EventId: globally unique identifier for
the business event. - EventType: stable event name. - EventVersion:
contract version. - OccurredAtUtc: time the business event occurred. -
TenantId: tenant scope. - CorrelationId: end-to-end workflow
correlation. - CausationId: identifier of the event or command that
caused this event, where available. - Payload: event-specific immutable
data.

Do not redundantly wrap MassTransit's built-in message metadata without
a clear reason. Establish one consistent convention and document it.

## 11.3 Event Contracts

The following are proposed initial contract shapes. They should be
placed in a dedicated integration-contracts project and must not
reference EF entities or service implementation classes.

``` csharp
namespace GymPlatform.Contracts.Events;

public record MemberRegisteredV1(
    Guid EventId,
    Guid TenantId,
    Guid MemberId,
    string MemberCode,
    string FullName,
    string PhoneNumber,
    string? Email,
    Guid MembershipId,
    Guid PlanId,
    DateOnly MembershipStartDate,
    DateOnly MembershipEndDate,
    DateTimeOffset OccurredAtUtc,
    Guid CorrelationId
);

public record MembershipExpiringSoonV1(
    Guid EventId,
    Guid TenantId,
    Guid MemberId,
    Guid MembershipId,
    string FullName,
    string PhoneNumber,
    string? Email,
    DateOnly ExpiryDate,
    int DaysUntilExpiry,
    DateTimeOffset OccurredAtUtc,
    Guid CorrelationId
);

public record PaymentCapturedV1(
    Guid EventId,
    Guid TenantId,
    Guid PaymentId,
    Guid InvoiceId,
    Guid MemberId,
    Guid MembershipId,
    decimal Amount,
    string Currency,
    string Provider,
    string ProviderPaymentId,
    DateTimeOffset CapturedAtUtc,
    Guid CorrelationId
);
```

Contract design notes: - Include only the data consumers need. - Avoid
publishing full database entities. - Do not publish secrets, access
tokens, or payment card data. - Use decimal for money and include
currency. - Use UTC timestamps for instants and DateOnly for business
dates. - Keep contract types immutable. - Use explicit V1/V2 contract
names or a documented schema-version strategy. - Add optional fields for
compatible evolution. - Introduce a new version for breaking semantic or
structural changes. - Maintain consumer compatibility during rolling
deployments. - Do not assume that every consumer is upgraded at the same
time.

## 11.4 Event: MemberRegistered

Publisher: Members.

Trigger: - A member and the relevant initial membership/purchase record
have been committed according to the chosen registration workflow.

Consumers: - Billing: creates an invoice or billing workflow record if
Billing owns invoice creation for this event. - Notifications: sends
welcome/registration communication. - Reporting: updates registration
and membership projections.

Important design decision: The registration event should not imply that
payment has been captured or that a paid membership is active. The event
must clearly communicate whether the membership is pending payment or
otherwise eligible. If invoice creation is triggered by a separate
purchase request, use a command such as CreateInvoice rather than
overloading MemberRegistered.

## 11.5 Event: MembershipExpiringSoon

Publisher: Members.

Trigger: - Scheduled expiry scan identifies a membership in the
configured reminder window.

Consumers: - Notifications: sends an expiry reminder. - Reporting:
optionally updates upcoming-expiry projections.

Deduplication key: - TenantId + MembershipId +
ReminderWindow/ReminderDate.

## 11.6 Event: PaymentCaptured

Publisher: Billing.

Trigger: - Billing has verified the payment provider event, matched the
expected order/invoice/amount/currency, and committed the payment state.

Consumers: - Members: validates the membership/payment relationship and
activates the appropriate membership. - Notifications: sends a payment
confirmation/receipt. - Reporting: updates paid invoice and revenue
projections.

The Members consumer must not activate an arbitrary membership based
only on a MemberId in a message. It must validate the membership
identifier, tenant, expected payment state, and event relationship. If
the workflow needs stronger coordination, use a payment/membership state
machine or explicit command-response workflow.

## 11.7 Additional Recommended Events

Potential later contracts: - TenantCreatedV1 - StaffInvitedV1 -
MembershipActivatedV1 - MembershipRenewedV1 - MembershipExpiredV1 -
InvoiceCreatedV1 - PaymentFailedV1 - NotificationDeliveryUpdatedV1 -
DailyOwnerReportGeneratedV1

Do not implement every event in the first iteration. Add contracts when
a real service boundary or consumer requires them.

## 11.8 Transactional Outbox

The Outbox pattern is required for critical business events.

Expected flow: 1. A service begins a database transaction. 2. It saves
the business entity changes. 3. It saves the outgoing event in the
Outbox table within the same transaction. 4. The transaction commits. 5.
A background publisher reads pending Outbox messages. 6. The publisher
sends the event to RabbitMQ. 7. The Outbox record is marked as
dispatched or otherwise tracked according to the library implementation.

This prevents a database commit from succeeding while event publication
is silently lost due to a process crash or broker outage.

Use MassTransit's supported Entity Framework transactional outbox
integration where compatible with the selected version and database
provider. Configure the bus outbox and consumer outbox deliberately;
test the actual transaction behavior rather than assuming that
installing a package enables it automatically.

## 11.9 Idempotent Consumers

RabbitMQ delivery is generally at-least-once in a reliable
configuration. A consumer may receive a duplicate after a crash or
acknowledgement failure.

Each consumer must: - Identify the message/event uniquely. - Persist
processed-message identity or a domain-level idempotency key. - Perform
the business update and processed-message record atomically where
possible. - Return success for a previously completed event without
repeating side effects. - Use provider idempotency keys where supported
for outbound payments or messages.

A notification consumer must not send a second WhatsApp message merely
because the same event is redelivered. Since external provider calls and
local database transactions cannot usually be made one atomic
transaction, implement a delivery state machine and provider idempotency
support where available. Define the behavior for the ambiguous case
where the provider accepted a message but the application crashed before
recording the response.

## 11.10 Retry and Error Handling

-   Retry transient network, broker, and provider errors with bounded
    exponential backoff and jitter.
-   Do not retry permanent validation failures indefinitely.
-   Configure a maximum retry count.
-   Move exhausted messages to an observable error/dead-letter path.
-   Include event identity and correlation identifiers in logs.
-   Provide a documented replay/recovery procedure.
-   Ensure replay does not duplicate financial or notification side
    effects.

------------------------------------------------------------------------

# 12. Background Processing and Scheduling

## 12.1 Background Work Categories

  -----------------------------------------------------------------------
  Work                                Mechanism
  ----------------------------------- -----------------------------------
  Publish pending Outbox events       Background publisher / MassTransit
                                      Outbox

  Process integration events          MassTransit consumers

  Scan expiring memberships           Members BackgroundService or
                                      scheduler

  Generate daily owner summary        Reporting scheduled worker

  Send queued notifications           Notifications consumers/workers

  Retry failed delivery               Bounded retry and error-handling
                                      policy
  -----------------------------------------------------------------------

## 12.2 Initial Schedules

  -----------------------------------------------------------------------
  Job                     Initial schedule        Owner
  ----------------------- ----------------------- -----------------------
  Expiry scan             Daily at 09:00 tenant   Members
                          local time              

  Daily owner report      Daily at 08:00 tenant   Reporting
  generation              local time              

  Outbox dispatch         Continuous/background   Each publishing service

  Operational cleanup     Periodic, if required   Owning service
  -----------------------------------------------------------------------

If the application supports multiple tenant timezones, scheduling must
evaluate each tenant's local time rather than assume one global server
timezone.

## 12.3 Scheduling Reliability

-   A job must be safe to execute more than once.
-   Job execution must be recorded or otherwise deduplicated.
-   Multiple application instances must not independently produce
    duplicate work.
-   Use a distributed lock or persistent scheduler when multiple
    instances can run concurrently.
-   A BackgroundService is acceptable for a single-instance MVP if its
    limitations are documented.
-   Hangfire or another persistent scheduler can be introduced when
    durable job history, retries, dashboards, and multi-instance
    coordination are required.

## 12.4 Failure Behavior

If a scheduled job fails: - Log the failure with tenant and job
context. - Do not silently skip the entire day's work. - Allow a safe
retry or next-run recovery. - Prevent duplicate reminders through
business idempotency keys. - Expose job health and last-success time to
operators.

------------------------------------------------------------------------

# 13. API Requirements

## 13.1 API Conventions

-   Use REST-style HTTP endpoints.
-   Use HTTPS outside local development.
-   Use versioned API routes, for example `/api/v1/...`.
-   Use consistent request and response DTOs.
-   Use consistent validation and error responses.
-   Support pagination for list endpoints.
-   Use UTC timestamps for instants.
-   Do not expose EF entities directly.
-   Do not expose internal service URLs to the browser.
-   Require authentication and authorization for protected operations.

## 13.2 Indicative Endpoint Catalogue

These are proposed endpoint names and must be refined during
implementation.

### Authentication / Identity

-   `POST /api/v1/auth/login`
-   `POST /api/v1/auth/logout` (if session/revocation model supports it)
-   `POST /api/v1/auth/refresh` (if refresh tokens are implemented)
-   `POST /api/v1/auth/forgot-password`
-   `POST /api/v1/auth/reset-password`

### Tenant administration

-   `POST /api/v1/tenants`
-   `GET /api/v1/tenants`
-   `GET /api/v1/tenants/{tenantId}`
-   `PATCH /api/v1/tenants/{tenantId}/status`

### Staff

-   `POST /api/v1/staff`
-   `GET /api/v1/staff`
-   `GET /api/v1/staff/{staffId}`
-   `PATCH /api/v1/staff/{staffId}`
-   `PATCH /api/v1/staff/{staffId}/status`

### Gym profile

-   `GET /api/v1/gym/profile`
-   `PUT /api/v1/gym/profile`

### Plans

-   `POST /api/v1/plans`
-   `GET /api/v1/plans`
-   `GET /api/v1/plans/{planId}`
-   `PUT /api/v1/plans/{planId}`
-   `PATCH /api/v1/plans/{planId}/status`

### Members

-   `POST /api/v1/members`
-   `GET /api/v1/members`
-   `GET /api/v1/members/{memberId}`
-   `PUT /api/v1/members/{memberId}`
-   `GET /api/v1/members/{memberId}/memberships`
-   `POST /api/v1/members/{memberId}/renewals`

### Memberships

-   `GET /api/v1/memberships`
-   `GET /api/v1/memberships/{membershipId}`
-   `PATCH /api/v1/memberships/{membershipId}/cancel` (if cancellation
    is in MVP)

### Billing

-   `POST /api/v1/invoices`
-   `GET /api/v1/invoices`
-   `GET /api/v1/invoices/{invoiceId}`
-   `POST /api/v1/payments/checkout`
-   `GET /api/v1/payments/{paymentId}`
-   `POST /api/v1/webhooks/razorpay`

### Reporting

-   `GET /api/v1/reports/dashboard`
-   `GET /api/v1/reports/daily-summary`
-   `GET /api/v1/reports/upcoming-expiries`

### Health

-   `GET /health/live`
-   `GET /health/ready`

The webhook endpoint must be reachable by the payment provider through
the public Gateway or a deliberately exposed Billing endpoint. It must
not require a browser JWT; it must authenticate the webhook using the
provider signature and apply strict request validation.

## 13.3 Error Response

Use a consistent error format, preferably based on Problem Details (RFC
9457 / ASP.NET Core ProblemDetails), with: - Type - Title - Status -
Detail safe for the caller - Instance - TraceId / correlation
identifier - Validation errors when relevant

Never expose stack traces, SQL errors, secrets, or internal
infrastructure details to API clients.

## 13.4 Pagination and Filtering

List endpoints should support: - `page` - `pageSize` - Search term -
Status filter - Date range where relevant - Sort field and direction
from an allowlist

Enforce a maximum page size.

------------------------------------------------------------------------

# 14. Data Requirements

## 14.1 Core Data Model

The following is a logical model. Each entity belongs to one owning
service; this is not a shared database schema.

### Identity / Tenant data

**Tenant** - TenantId (GUID) - Name - Slug / Code - Status -
TimeZoneId - CurrencyCode - CreatedAtUtc - UpdatedAtUtc

**User** - UserId (GUID) - TenantId (nullable for Super Admin) - Email -
PasswordHash (managed by Identity) - Role - AccountStatus -
CreatedAtUtc - UpdatedAtUtc

### Members data

**Member** - MemberId (GUID) - TenantId - MemberCode - FullName -
PhoneNumber - Email (nullable) - CreatedAtUtc - UpdatedAtUtc -
IsActive - DeletedAtUtc (nullable, if soft delete is used)

**MembershipPlan** (if plan ownership is assigned to Members; otherwise
place in Billing and exchange plan snapshots/identifiers) - PlanId -
TenantId - Name - DurationValue - DurationUnit - Price - Currency -
IsActive

**Membership** - MembershipId - TenantId - MemberId - PlanId -
PlanNameSnapshot - PriceSnapshot - Currency - StartDate - EndDate -
Status - CreatedAtUtc - UpdatedAtUtc

Architecture decision required: Plans and invoices are closely related
to Billing, but membership entitlements are owned by Members. The team
must decide whether plan catalogue ownership belongs to Billing or
Members. Recommended boundary: Billing owns purchasable plan/pricing and
invoices; Members owns membership entitlement. Events/commands carry
immutable plan and purchase snapshots needed by Members. Do not
duplicate editable plan ownership across services.

### Billing data

**Invoice** - InvoiceId - TenantId - MemberId - MembershipId -
InvoiceNumber - Amount - Currency - Status - IssuedAtUtc - DueAtUtc -
PaidAtUtc (nullable)

**InvoiceLine** - InvoiceLineId - InvoiceId - Description - Quantity -
UnitPrice - LineTotal

**Payment** - PaymentId - TenantId - InvoiceId - Provider -
ProviderOrderId - ProviderPaymentId - Amount - Currency - Status -
CapturedAtUtc - CreatedAtUtc

**WebhookReceipt** - WebhookReceiptId - ProviderEventId or stable
provider idempotency key - ReceivedAtUtc - ProcessingStatus -
PayloadHash / safe metadata

### Notifications data

**Notification** - NotificationId - TenantId - Recipient - Channel -
NotificationType - BusinessReference - TemplateIdentifier - Status -
CreatedAtUtc - LastAttemptAtUtc

**NotificationAttempt** - AttemptId - NotificationId - AttemptNumber -
ProviderMessageId - Status - ErrorCode - ErrorSummary - AttemptedAtUtc

### Reporting data

Reporting owns denormalized projections, for example: -
MemberCountByStatus - MembershipExpiryProjection -
InvoicePaymentProjection - DailyTenantSummary - ProcessedEvent

Read models are rebuildable from retained events or controlled
reconciliation jobs where event retention and source access policies
permit.

## 14.2 Data Integrity

-   Use GUID identifiers for cross-service references.
-   A cross-service identifier is a reference, not a database foreign
    key.
-   Enforce tenant scope in every tenant-owned query and command.
-   Use unique constraints for tenant-scoped business identifiers.
-   Use database transactions for local invariants.
-   Use optimistic concurrency where concurrent updates may conflict.
-   Preserve financial and membership history.
-   Use soft deletion only where it supports a clear recovery/audit
    requirement; define retention and privacy policies.
-   Do not cascade-delete financial history when a member record is
    deactivated.

## 14.3 Tenant Isolation

Recommended MVP approach: - Shared database per service with TenantId on
every tenant-owned row. - TenantId derived from trusted authenticated
claims or trusted service context. - EF Core global query filters as
defense in depth. - Explicit tenant authorization in application/service
methods. - Tenant-aware unique indexes. - Automated cross-tenant
integration tests.

Global query filters are not a complete security boundary. Ensure raw
SQL, background jobs, administrative paths, message consumers, and bulk
operations apply tenant scoping explicitly. Do not trust a TenantId
supplied in a public request body.

------------------------------------------------------------------------

# 15. User Interface Requirements

## 15.1 General UI

-   Responsive web dashboard.
-   Role-aware navigation.
-   Consistent validation and error feedback.
-   Loading, empty, success, and failure states.
-   Confirmation for destructive or high-impact operations.
-   Accessible labels and keyboard navigation for core workflows.
-   No secrets or provider credentials in browser code.

## 15.2 Super Admin Portal

Pages: - Login. - Platform overview. - Tenant list. - Create tenant. -
Tenant details. - Activate/suspend tenant. - Initial owner provisioning.

## 15.3 Gym Owner Portal

Pages: - Dashboard. - Gym profile/settings. - Staff management. -
Add/edit staff. - Membership plans. - Members. - Memberships and
expiries. - Invoices and payments. - Reports. - Notification
preferences.

## 15.4 Receptionist Portal

Pages: - Dashboard / quick actions. - Register member. - Member list. -
Member details. - Membership purchase/renewal. - Payment status. -
Invoice/receipt view.

## 15.5 Trainer Portal

MVP pages: - Dashboard. - Profile. - Assigned members, if assignment is
enabled.

Future pages: - Attendance. - Workout plans. - Training schedule.

## 15.6 Member Portal

Not required for MVP. Future pages: - Login. - Membership details. -
Payment history. - Receipts. - Renewal. - Attendance history.

------------------------------------------------------------------------

# 16. Non-Functional Requirements

## 16.1 Security

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  NFR-SEC-001                         All external traffic shall use
                                      HTTPS in deployed environments.

  NFR-SEC-002                         Passwords shall be securely hashed
                                      using a maintained identity
                                      framework.

  NFR-SEC-003                         Authorization shall be enforced
                                      server-side.

  NFR-SEC-004                         Tenant isolation shall be tested at
                                      API, application, and data-access
                                      boundaries.

  NFR-SEC-005                         Secrets shall be stored outside
                                      source control and browser bundles.

  NFR-SEC-006                         Razorpay webhook signatures shall
                                      be verified using the raw request
                                      body and configured secret.

  NFR-SEC-007                         Input shall be validated and output
                                      encoded appropriately.

  NFR-SEC-008                         APIs shall apply rate limiting to
                                      sensitive endpoints such as login
                                      and webhooks.

  NFR-SEC-009                         Logs shall not contain passwords,
                                      access tokens, payment secrets, or
                                      unnecessary personal data.

  NFR-SEC-010                         Security-relevant actions shall be
                                      auditable.

  NFR-SEC-011                         CORS shall allow only approved
                                      frontend origins in deployed
                                      environments.

  NFR-SEC-012                         Dependencies shall be reviewed and
                                      updated for security
                                      vulnerabilities.
  -----------------------------------------------------------------------

## 16.2 Reliability

-   Critical business events must use an Outbox.
-   Consumers must be idempotent.
-   Queues must be durable and messages persistent where required.
-   Consumer acknowledgement must follow successful processing.
-   Retry policies must be bounded.
-   Poison messages must be observable and recoverable.
-   External provider failure must not roll back an already committed
    member registration.
-   Payment processing must be protected against duplicate webhooks.
-   Backups and restore procedures must be documented before production
    launch.

## 16.3 Performance

Initial engineering targets, to be validated by load tests: - Typical
read API requests should target a p95 latency below 500 ms under the
agreed test load. - Typical write API requests should target a p95
latency below 800 ms, excluding external provider calls. - Member list
endpoints must be paginated. - Database queries must be indexed based on
actual filters and sort patterns. - External WhatsApp and payment calls
must not be made while holding long-running database transactions. -
Reporting queries should use read projections rather than repeatedly
scanning transactional tables across services. - Cache only after
measuring a real bottleneck; Redis is optional for MVP.

These targets are engineering objectives, not guaranteed service-level
commitments.

## 16.4 Scalability

-   Each service shall be independently deployable.
-   Stateless API instances should be horizontally scalable.
-   Consumers should support multiple instances where message ordering
    and concurrency rules permit.
-   Database indexes should support tenant-scoped access.
-   Queue depth and consumer throughput should be observable.
-   Reporting read models should be independently scalable.
-   Avoid shared mutable in-memory state for distributed coordination.

## 16.5 Availability and Recovery

-   Services should expose liveness and readiness endpoints.
-   Broker/database outages should be visible in health status.
-   Critical messages should remain queued during temporary consumer
    outages.
-   Recovery procedures should cover broker reconnection and error-queue
    replay.
-   Backup frequency and recovery objectives must be agreed before
    production.

## 16.6 Maintainability

-   Follow Clean Architecture within each service.
-   Keep domain logic independent of transport and persistence details.
-   Use dependency injection.
-   Use DTOs and validators at API boundaries.
-   Use consistent naming and API conventions.
-   Maintain automated unit and integration tests.
-   Document environment configuration and local setup.
-   Avoid circular project references and shared service entities.

## 16.7 Observability

-   Structured logs through Serilog.
-   Distributed traces through OpenTelemetry.
-   CorrelationId propagation through HTTP and RabbitMQ.
-   Metrics for request latency, error rate, queue depth, consumer
    failures, Outbox backlog, and notification outcomes.
-   Health checks for database and broker connectivity.
-   Alerting for repeated payment failures, stuck Outbox records, and
    growing error queues.

## 16.8 Privacy and Data Protection

-   Collect only information needed for gym operations.
-   Define retention and deletion policies.
-   Restrict access to member contact details.
-   Obtain and record appropriate consent for communications where
    required.
-   Provide a way to suppress non-essential messages.
-   Follow applicable Indian data protection and consumer communication
    requirements.
-   Do not use real customer data in development or demonstration
    environments.

------------------------------------------------------------------------

# 17. Failure Scenarios and Recovery Requirements

  -----------------------------------------------------------------------
  Scenario                            Expected behavior
  ----------------------------------- -----------------------------------
  RabbitMQ unavailable during         Member and Outbox event commit
  registration                        together; publisher retries after
                                      broker recovery

  Notifications service offline       Messages remain in its durable
                                      queue and are processed after
                                      recovery

  Billing consumer fails              Its message is retried according to
                                      policy; exhausted messages become
                                      visible in error handling

  Duplicate MemberRegistered event    Consumer idempotency prevents
                                      duplicate
                                      invoice/notification/projection

  Duplicate Razorpay webhook          Billing recognizes the provider
                                      event/payment and does not
                                      double-capture business state

  WhatsApp provider timeout           Notification attempt is retried
                                      only when safe; ambiguous outcomes
                                      are tracked

  Reporting service offline           Reporting queue accumulates events;
                                      read model catches up after
                                      recovery

  Database unavailable                Readiness fails; requests are
                                      rejected safely; no false success
                                      response

  Invalid webhook signature           Request is rejected and
                                      security-relevant metadata is
                                      logged

  Tenant context missing              Tenant-scoped operation is rejected

  Cross-tenant identifier supplied    Authorization fails without
                                      disclosing another tenant's data

  Scheduled job runs twice            Business idempotency prevents
                                      duplicate reminders/reports
  -----------------------------------------------------------------------

## 17.1 Failure Demonstration

The project demonstration should include: 1. Start the system. 2. Stop
Notifications. 3. Register a new member. 4. Confirm the Members API
succeeds. 5. Inspect the Notifications queue and show the pending
message. 6. Restart Notifications. 7. Show the message being consumed.
8. Confirm notification processing is recorded. 9. Demonstrate that
duplicate delivery does not create an unintended duplicate side effect.

A second demonstration should show duplicate payment webhook delivery
and confirm that invoice/payment state is not duplicated.

------------------------------------------------------------------------

# 18. Testing Strategy

## 18.1 Unit Testing

Test: - Membership date calculation. - Membership state transitions. -
Plan duration rules. - Tenant authorization logic. - Invoice amount
calculations. - Payment state transitions. - Expiry reminder
eligibility. - Daily report metric definitions. - Consumer idempotency
decisions.

## 18.2 Integration Testing

Test: - API + database persistence. - EF Core tenant filters. - Outbox
persistence and dispatch. - RabbitMQ publish/consume behavior. -
Consumer retry and error handling. - Razorpay webhook signature
validation. - Notifications provider adapter behavior. - Reporting
projection updates.

Use isolated test databases and a test broker/container where available.
If Docker is unavailable, use an approved hosted development broker or
an environment-specific integration test setup. Do not make production
tests depend on a developer's personal broker.

## 18.3 Contract Testing

-   Verify event payload compatibility.
-   Verify consumers can deserialize the published event versions.
-   Test backward compatibility during deployment.
-   Verify required event metadata.
-   Ensure event contracts do not expose internal entity structures.

## 18.4 Security Testing

-   Unauthenticated endpoint access.
-   Role escalation attempts.
-   Cross-tenant access attempts.
-   TenantId spoofing.
-   Invalid/expired JWT.
-   Brute-force/rate-limit behavior.
-   Invalid webhook signatures.
-   Duplicate webhook delivery.
-   Sensitive data leakage in logs and error responses.

## 18.5 End-to-End Testing

Primary end-to-end scenario: 1. Super Admin creates a tenant and Gym
Owner. 2. Gym Owner signs in. 3. Gym Owner creates Receptionist and
Trainer accounts. 4. Receptionist signs in. 5. Receptionist registers a
member and selects a plan. 6. Billing creates an invoice/payment order.
7. Razorpay test payment is completed. 8. Billing verifies webhook and
publishes PaymentCaptured. 9. Members activates the appropriate
membership. 10. Notifications records/sends the receipt confirmation.
11. Reporting updates dashboard projections. 12. Expiry job later
detects a membership in the reminder window. 13. Notifications processes
the reminder event. 14. Reporting generates the daily owner summary.

## 18.6 Test Data

-   Use synthetic names, phone numbers, and email addresses.
-   Use Razorpay test credentials and test payment methods.
-   Use fake notification sender by default.
-   Never send unsolicited messages to real phone numbers during
    testing.
-   Keep test tenants separate from any future customer tenants.

------------------------------------------------------------------------

# 19. Deployment and DevOps Requirements

## 19.1 Repository Structure

Proposed monorepo:

``` text
GymMembershipPlatform/
│
├── src/
│   ├── Gateway/
│   │   └── GymPlatform.Gateway/
│   │
│   ├── Services/
│   │   ├── Identity/
│   │   │   ├── Identity.Api/
│   │   │   ├── Identity.Application/
│   │   │   ├── Identity.Domain/
│   │   │   └── Identity.Infrastructure/
│   │   │
│   │   ├── Members/
│   │   │   ├── Members.Api/
│   │   │   ├── Members.Application/
│   │   │   ├── Members.Domain/
│   │   │   └── Members.Infrastructure/
│   │   │
│   │   ├── Billing/
│   │   │   ├── Billing.Api/
│   │   │   ├── Billing.Application/
│   │   │   ├── Billing.Domain/
│   │   │   └── Billing.Infrastructure/
│   │   │
│   │   ├── Notifications/
│   │   │   ├── Notifications.Api/
│   │   │   ├── Notifications.Application/
│   │   │   ├── Notifications.Domain/
│   │   │   └── Notifications.Infrastructure/
│   │   │
│   │   └── Reporting/
│   │       ├── Reporting.Api/
│   │       ├── Reporting.Application/
│   │       ├── Reporting.Domain/
│   │       └── Reporting.Infrastructure/
│   │
│   └── BuildingBlocks/
│       ├── GymPlatform.Contracts/
│       └── GymPlatform.Messaging/
│
├── frontend/
│   └── gym-platform-dashboard/
│
├── tests/
│   ├── Identity.UnitTests/
│   ├── Members.UnitTests/
│   ├── Billing.UnitTests/
│   ├── Notifications.UnitTests/
│   ├── Reporting.UnitTests/
│   ├── IntegrationTests/
│   └── ArchitectureTests/
│
├── infrastructure/
│   ├── docker/
│   ├── rabbitmq/
│   ├── monitoring/
│   └── deployment/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── event-contracts/
│   └── runbooks/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── .editorconfig
├── .gitignore
└── README.md
```

If Identity is not deployed independently in the MVP, its projects may
be hosted within the Members deployment while preserving a clear module
boundary. The repository structure must reflect the chosen deployment
boundary rather than creating an empty service.

## 19.2 Local Infrastructure

Docker Compose should provide, where local Docker is permitted: -
RabbitMQ with management UI. - PostgreSQL. - Optional Redis. - Optional
OpenTelemetry Collector. - Backend service containers as the system
matures. - Frontend development server may run outside Compose.

Never commit real secrets to Compose files. Use environment variables
and local secret files excluded from source control.

## 19.3 CI Pipeline

On pull request: - Restore dependencies. - Build all affected
services. - Run unit tests. - Run integration tests where infrastructure
is available. - Run formatting and analyzers. - Check for vulnerable
dependencies. - Build frontend. - Build container images if configured.

On approved main-branch deployment: - Build immutable artifacts. - Apply
database migrations through a controlled deployment step. - Deploy
affected services. - Run health checks. - Retain rollback artifacts and
deployment logs.

Database migrations must be service-owned. Avoid multiple services
attempting to modify the same database schema.

## 19.4 Configuration

Use environment-specific configuration: - Development - Test - Staging -
Production

Secrets include: - JWT signing key. - Database credentials. - RabbitMQ
credentials. - Razorpay key secret and webhook secret. - WhatsApp access
token. - Email provider credentials.

Use a managed secret store in production where available. Rotate secrets
and restrict their access.

------------------------------------------------------------------------

# 20. Implementation Roadmap --- 5 Weeks

The roadmap prioritizes an end-to-end working vertical slice before
advanced features.

## Week 1 --- Foundation and Members + Messaging

Deliverables: - Create repository and solution. - Create shared
integration contracts project. - Create Members service with Clean
Architecture. - Configure PostgreSQL and EF Core. - Implement
tenant-aware member and membership models. - Configure RabbitMQ and
MassTransit. - Configure transactional Outbox. - Publish
MemberRegisteredV1. - Create a minimal consumer or test harness to prove
delivery. - Add basic unit and integration tests. - Document local
setup.

Acceptance: - Member registration persists successfully. - Outbox record
is committed with the member transaction. - Event reaches a durable
queue. - Broker outage does not silently lose the committed event.

## Week 2 --- Identity, Tenant, Plans and Billing

Deliverables: - Super Admin login. - Tenant creation and initial Gym
Owner provisioning. - Owner login and staff creation. - Tenant
authorization. - Plan catalogue. - Invoice creation. - Razorpay
test-mode order creation. - Webhook signature verification. - Payment
idempotency. - PaymentCapturedV1 publication. - Members consumer
activates the correct membership after validation.

Acceptance: - One tenant cannot access another tenant's records. - A
verified payment updates billing state once. - A duplicate webhook does
not duplicate the business operation. - Membership activation follows
the documented payment rule.

## Week 3 --- Notifications and Expiry Automation

Deliverables: - Notifications service. - MemberRegistered consumer. -
PaymentCaptured consumer. - MembershipExpiringSoon consumer. -
IMessageSender abstraction. - Fake/console sender. - Notification
persistence and attempt tracking. - Members expiry scan. - Retry/error
queue configuration. - Daily owner report delivery integration.

Acceptance: - Events generate expected fake messages. - Stopping
Notifications does not block registration. - Pending notifications
process after recovery. - Duplicate event delivery does not create
unintended duplicate messages.

## Week 4 --- Reporting, Gateway and Frontend

Deliverables: - Reporting projections. - Dashboard endpoints. - Daily
report generation. - YARP Gateway. - React role-aware dashboard. -
Member registration/list/detail UI. - Staff management UI. - Plan and
payment views. - Basic charts and filters. - Correlation ID propagation.

Acceptance: - Owner sees tenant-specific counts. - Receptionist can
register a member through the Gateway. - Dashboard data is derived from
Reporting's own read model. - A user cannot access pages or APIs outside
their permissions.

## Week 5 --- Hardening, Observability and Demonstration

Deliverables: - Outbox and idempotency review. - Retry and error-queue
replay runbook. - OpenTelemetry traces. - Serilog structured logging. -
Health checks. - Security tests. - End-to-end tests. - Docker Compose
and setup documentation. - GitHub Actions pipeline. - Synthetic demo
data. - Architecture diagram and event-flow documentation. - Final
project presentation and README.

Acceptance: - Core end-to-end workflow passes. - Failure recovery demo
passes. - Cross-tenant tests pass. - Build and test pipeline passes. -
Deployment instructions are reproducible.

## 20.1 Scope Control

If the schedule becomes tight, prioritize in this order:

1.  Member registration and persistence.
2.  RabbitMQ event publishing and Outbox.
3.  Billing and verified payment event.
4.  Notifications with fake sender.
5.  Tenant isolation and role authorization.
6.  Reporting read model.
7.  Gateway and frontend polish.
8.  Production WhatsApp integration.
9.  Advanced observability and optional features.

Do not sacrifice tenant isolation, payment verification, or event
reliability to add more UI pages.

------------------------------------------------------------------------

# 21. MVP Acceptance Criteria

The MVP is accepted when all P0 requirements and the following scenarios
pass.

### AC-001: Tenant onboarding

-   Super Admin creates a gym.
-   Initial Gym Owner is provisioned.
-   Owner can activate and sign in.

### AC-002: Staff onboarding

-   Gym Owner creates Receptionist and Trainer.
-   New accounts belong to the correct tenant.
-   Staff cannot elevate their own roles.

### AC-003: Member registration

-   Receptionist registers a member.
-   Member and membership records are persisted.
-   A registration event is stored in the Outbox.

### AC-004: Asynchronous processing

-   RabbitMQ distributes the event to independent queues.
-   Consumers process their own work without the HTTP registration
    request waiting for them.

### AC-005: Payment

-   Billing creates an invoice and payment order.
-   Razorpay webhook signature is verified.
-   Duplicate webhook delivery is idempotent.
-   PaymentCaptured is published after the local transaction commits.

### AC-006: Membership activation

-   Members validates the payment event.
-   The correct membership transitions to Active.
-   An unrelated or invalid membership cannot be activated.

### AC-007: Notifications

-   Fake sender records welcome and payment messages.
-   Notification provider failures do not undo member registration or
    payment capture.
-   Retry and error handling are observable.

### AC-008: Expiry reminder

-   Scheduled scan identifies eligible memberships.
-   Duplicate reminder generation is prevented.
-   Notifications processes the reminder.

### AC-009: Reporting

-   Reporting consumes events and updates its own projection.
-   Owner sees tenant-specific active, expired, and pending-payment
    metrics.
-   Daily summary can be generated and sent.

### AC-010: Tenant isolation

-   Cross-tenant API access is rejected.
-   TenantId from an untrusted request body cannot override
    authenticated tenant context.
-   Background consumers process events using the event's tenant scope
    and validate it.

### AC-011: Recovery

-   A consumer can be stopped while events accumulate.
-   On restart, it processes pending messages.
-   Duplicate delivery does not create duplicate business effects.

### AC-012: Operations

-   Logs include correlation identifiers.
-   Health endpoints reflect dependency state.
-   CI builds and tests the application.

------------------------------------------------------------------------

# 22. Risks and Mitigation

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Microservice scope      Incomplete product      Build one vertical
  exceeds 5 weeks                                 slice at a time; defer
                                                  optional features

  Company device blocks   Development delay       Use approved hosted
  Docker or package feeds                         broker/database or a
                                                  personal development
                                                  device

  WhatsApp template       Real messages           Use fake sender and
  approval delay          unavailable             approved templates only
                                                  when available

  Razorpay webhook        Payment flow blocked    Use test mode,
  configuration errors                            signature tests, and
                                                  webhook replay tooling

  Duplicate event         Duplicate side effects  Idempotent consumers
  delivery                                        and business keys

  Outbox configuration    Lost or repeated events Integration tests
  incorrect                                       around transaction and
                                                  broker failure

  Tenant data leakage     Critical security       Tenant-scoped queries,
                          incident                authorization,
                                                  automated isolation
                                                  tests

  Reporting projection    Inaccurate dashboard    Track consumer lag and
  becomes stale                                   provide reconciliation

  External API rate       Delayed notifications   Bounded retries,
  limits                                          throttling, and
                                                  delivery tracking

  Too many services too   Operational complexity  Keep service boundaries
  early                                           capability-based and
                                                  deploy only when useful

  Inconsistent            Incorrect access        Explicit state
  membership/payment      entitlement             transitions and
  states                                          validated event
                                                  relationships
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 23. Production Readiness Considerations

The MVP is a portfolio-quality implementation, not automatically a
production-certified commercial product.

Before onboarding real gyms, complete the following:

-   Security review and penetration testing.
-   Tenant isolation review, including background consumers and
    administrative paths.
-   Backup and restore verification.
-   Payment reconciliation and refund policy.
-   WhatsApp template approval and consent/opt-out handling.
-   Privacy policy, terms of service, and data processing terms.
-   Applicable Indian privacy and consumer communication compliance
    review.
-   Incident response and operational runbooks.
-   Monitoring and alerting.
-   Rate limits and abuse prevention.
-   Data retention and deletion workflows.
-   Availability and recovery objectives.
-   Load and soak testing.
-   Support and customer onboarding processes.
-   Production secrets management.
-   Database migration and rollback strategy.

Never claim a production SLA, regulatory certification, or guaranteed
provider delivery without evidence.

------------------------------------------------------------------------

# 24. Demonstration Plan

A strong technical demonstration should tell one connected business
story.

## Demo 1 --- Tenant onboarding

1.  Log in as Super Admin.
2.  Create FitZone Gym.
3.  Provision its Gym Owner.
4.  Log in as Gym Owner.
5.  Create Receptionist and Trainer accounts.

## Demo 2 --- Member registration

1.  Log in as Receptionist.
2.  Register a synthetic member.
3.  Select a membership plan.
4.  Submit registration.
5.  Show the saved member and Outbox record.

## Demo 3 --- Event-driven processing

1.  Show RabbitMQ exchanges and independent queues.
2.  Show Billing receiving the registration/purchase event.
3.  Show Notifications receiving the event.
4.  Show Reporting updating its projection.
5.  Show the fake welcome message.

## Demo 4 --- Payment processing

1.  Create a test invoice/payment order.
2.  Complete a Razorpay test payment.
3.  Show webhook signature verification.
4.  Show PaymentCaptured publication.
5.  Show membership activation and receipt notification.
6.  Replay the webhook and demonstrate idempotency.

## Demo 5 --- Failure recovery

1.  Stop Notifications.
2.  Register another synthetic member.
3.  Show the message waiting in the durable queue.
4.  Restart Notifications.
5.  Show successful processing.
6.  Explain retry and error-queue behavior.

## Demo 6 --- Automated operations

1.  Seed a synthetic membership expiring in two days.
2.  Trigger the expiry scan in a controlled test mode.
3.  Show MembershipExpiringSoon.
4.  Show the fake reminder message.
5.  Generate the daily owner report.
6.  Show tenant-specific dashboard metrics.

## Demo 7 --- Tenant isolation

1.  Sign in as FitZone staff.
2.  Attempt to retrieve another gym's member using a known test
    identifier.
3.  Show the request being rejected without leaking the other tenant's
    data.

------------------------------------------------------------------------

# 25. Resume and Portfolio Positioning

## Suggested Project Title

**GymFlow --- Multi-Tenant Event-Driven Gym Membership Automation
Platform**

The product name is provisional and should be checked for
trademark/domain availability before commercial use.

## Suggested Resume Bullet

> Designed and developed a multi-tenant gym membership automation
> platform using ASP.NET Core, PostgreSQL, RabbitMQ, MassTransit, and
> YARP. Implemented event-driven workflows with transactional Outbox,
> idempotent consumers, payment webhook verification, automated
> membership reminders, and CQRS-based reporting.

Only retain technologies and features in the resume after they are
actually implemented and tested.

## Technical Skills Demonstrated

-   ASP.NET Core and Clean Architecture.
-   EF Core and PostgreSQL.
-   REST API design.
-   JWT and role-based authorization.
-   Multi-tenant data isolation.
-   RabbitMQ and MassTransit.
-   Event-driven architecture.
-   Transactional Outbox.
-   Idempotent message processing.
-   Retry and dead-letter/error handling.
-   Payment webhook verification.
-   Third-party API integration.
-   Background processing.
-   CQRS read projections.
-   YARP API Gateway.
-   React and TypeScript.
-   Docker Compose.
-   CI/CD.
-   OpenTelemetry and structured logging.
-   Unit, integration, and end-to-end testing.

------------------------------------------------------------------------

# 26. Open Architecture Decisions

The following decisions must be finalized before or during
implementation. They are intentionally visible rather than silently
assumed.

  -----------------------------------------------------------------------
  Decision                            Recommended MVP choice
  ----------------------------------- -----------------------------------
  Runtime                             .NET 10 LTS

  Database                            PostgreSQL

  Frontend                            React + TypeScript

  Service count                       Five business services if Identity
                                      is independently deployed;
                                      otherwise four business deployments
                                      plus an isolated Identity module,
                                      and one Gateway

  Identity ownership                  Dedicated Identity service for
                                      clean separation if time permits;
                                      otherwise isolated module in
                                      Members for MVP

  Plan ownership                      Billing owns commercial
                                      plans/pricing; Members owns
                                      membership entitlements

  Membership activation               Activate paid membership only after
                                      verified payment; explicitly
                                      support authorized offline payment
                                      if required

  Member login                        Not required in MVP

  WhatsApp                            Fake sender first; Cloud API after
                                      credentials and template approval

  Scheduler                           BackgroundService for a
                                      single-instance MVP; persistent
                                      scheduler when multi-instance
                                      durability is required

  Broker                              RabbitMQ

  Messaging library                   MassTransit

  Outbox                              MassTransit EF Core transactional
                                      Outbox, verified with integration
                                      tests

  Reporting                           Separate read-model database

  Redis                               Deferred until a measured caching
                                      need exists

  SignalR                             Deferred until live dashboard
                                      updates are required

  Kafka                               Not required for MVP

  Saga                                Defer until a multi-step workflow
                                      needs explicit orchestration/state
                                      management

  Multi-branch support                Future enhancement

  Attendance                          Future enhancement
  -----------------------------------------------------------------------

## 26.1 Critical Workflow Decision: Registration and Payment

Recommended sequence:

1.  Receptionist creates the member and membership purchase request.
2.  Members commits the member/membership state and relevant Outbox
    event.
3.  Billing creates the invoice and payment order using an explicit
    purchase workflow.
4.  Member pays through Razorpay or an authorized offline-payment
    process is recorded.
5.  Billing verifies and commits payment capture.
6.  Billing publishes PaymentCaptured.
7.  Members validates the event and activates the correct membership.
8.  Notifications sends payment confirmation.
9.  Reporting updates the relevant projections.

This sequence is preferable to treating a simple member-registration
event as proof of payment or membership activation.

The exact command/event choreography should be finalized with the
service contracts before coding.

------------------------------------------------------------------------

# 27. Glossary

  -----------------------------------------------------------------------
  Term                                Definition
  ----------------------------------- -----------------------------------
  Tenant                              A gym business using the SaaS
                                      platform

  Super Admin                         Platform-level administrator

  Gym Owner                           Tenant administrator

  Receptionist                        Staff member responsible for
                                      front-desk operations

  Trainer                             Staff member responsible for
                                      fitness-related operations

  Gym Member                          Customer who purchases a gym
                                      membership

  Membership                          Time-bounded entitlement to use gym
                                      services

  Invoice                             Billing document representing an
                                      amount owed

  Payment                             Financial transaction associated
                                      with an invoice

  Event                               Immutable fact that has occurred

  Command                             Request for a component to perform
                                      an action

  RabbitMQ                            Message broker used for
                                      asynchronous communication

  Consumer                            Component that processes messages
                                      from a queue

  Outbox                              Durable record of events committed
                                      with business data

  Idempotency                         Ability to process a repeated
                                      request/event without repeating its
                                      business effect

  Dead-letter/error queue             Destination for messages that
                                      cannot be processed successfully

  CQRS                                Separation of write-side business
                                      operations and read-side
                                      projections

  Correlation ID                      Identifier used to trace a workflow
                                      across services

  YARP                                .NET reverse-proxy toolkit used for
                                      the API Gateway

  SaaS                                Software delivered as a service to
                                      multiple customers/tenants
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 28. Final Project Baseline

The Gym Membership Automation Platform shall be developed as a
multi-tenant, event-driven SaaS application focused on automating the
operational workflows of independent gyms.

The MVP shall prioritize: - Secure tenant onboarding and staff access. -
Member and membership lifecycle management. - Invoice and payment
processing. - Reliable asynchronous event processing. - Automated
notification workflows. - Owner-facing operational reporting. - Tenant
isolation and failure recovery.

The architecture shall use synchronous HTTP for interactive API requests
and RabbitMQ for asynchronous communication between backend services.
Critical event publication shall use a transactional Outbox, and
consumers shall implement idempotency and controlled retry/error
handling.

The MVP shall be delivered incrementally over approximately five weeks.
Features outside the defined MVP scope shall be deferred until the core
business workflow is stable and demonstrable.

**Document status:** Proposed SRS baseline. Changes to scope, service
ownership, payment lifecycle, event contracts, or tenant security must
be reviewed and recorded before implementation.
