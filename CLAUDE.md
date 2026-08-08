# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS (v11) REST API backend for "Bulmar" — a wedding planner platform with customer and vendor roles. TypeScript, TypeORM, PostgreSQL. Swagger docs served at `/api`.

## Commands

```bash
npm run start:dev      # run with watch mode (primary dev loop)
npm run start:debug     # watch mode with --inspect-brk
npm run build           # nest build
npm run lint            # eslint --fix on src, apps, libs, test

npm run test            # jest unit tests (*.spec.ts, colocated with source)
npm run test:watch
npm run test:cov
npm run test:e2e        # uses test/jest-e2e.json config

# run a single test file
npx jest src/modules/master/roles/roles.service.spec.ts
# run tests matching a name
npx jest -t "should create a role"
```

Jest root is `src/` (see `jest` key in `package.json`); test files are `*.spec.ts` colocated next to the code they test, not in a separate `test/` tree (that directory only holds the e2e spec).

Requires a `.env` file (not committed) with DB, JWT, mail, crypto, and OTP settings — see keys referenced in `src/app.module.ts`, `AuthModule`, `CryptographyService`, and `OtpService` (`DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CRYPTO_SECRET_KEY`, `MAIL_*`, `OTP_EXPIRES_IN_MINUTES`, `OTP_RESET_SESSION_MINUTES`). `TypeOrmModule` runs with `synchronize: false`, so schema changes are not applied automatically from entities — there is currently no migrations folder, so schema is managed externally.

## Architecture

### Module layout

All feature modules live under `src/modules/master/<feature>/`, each following the same Nest convention:

```
<feature>/
  <feature>.module.ts
  <feature>.controller.ts       # HTTP layer, decorated with @ApiTags/@ApiBearerAuth/@UseGuards(JwtAuthGuard)
  <feature>.service.ts          # business logic + TypeORM repository access
  dto/                          # class-validator DTOs (create/update/find-all)
  entities/                     # TypeORM entities, table schema `master`
  decorators/<feature>-swagger.decorator.ts   # composed @ApiOperation/@ApiResponse decorators, kept out of the controller
```

`src/modules/public/` exists as a placeholder for non-authenticated/public-facing modules (currently empty). `src/common/request/`, `src/config/`, and `src/database/` are also present but empty scaffolding — check before assuming shared utilities live there.

### Cross-cutting response envelope

Every controller response is wrapped by a global interceptor, not built manually in controllers:

- `ResponseInterceptor` (`src/common/response/interceptor/response.interceptor.ts`) wraps all handler returns as `{ status, message, data }`. If the returned value has a `meta` key (pagination), it's reshaped to `{ status, message, data: data.data, meta: data.meta }` instead — services that paginate should return `{ data, meta }`-shaped (or `{ data, total, pageNumber, pageSize }`, see below) objects.
- The message comes from the `@ResponseMessage('...')` decorator (`src/common/response/decorators/response-message.decorator.ts`) applied per-route handler; defaults to `'Success'` if omitted.
- Registered globally in `src/main.ts` alongside `ClassSerializerInterceptor` (which enforces `@Exclude()` fields on entities, e.g. `User.passwordHash`) and a global `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`.

Note: list endpoints currently return `{ data, total, pageNumber, pageSize }` from services (see `RolesService.findAll`) rather than `{ data, meta }` — the interceptor's `meta` check only special-cases the latter shape, so as written these list responses get double-wrapped into `data: { data, total, pageNumber, pageSize }`. Be aware of this when touching pagination — don't assume the interceptor already normalizes it.

### Auth & security model

- JWT auth via `@nestjs/passport` + `passport-jwt`. `JwtStrategy` (`src/modules/master/auth/strategies/jwt.strategy.ts`) validates the bearer token; `JwtAuthGuard` is applied per-controller with `@UseGuards(JwtAuthGuard)` (opt-in per controller, not global).
- Roles are many-to-many via the `UserRole` join entity (`src/modules/master/user-roles/`), with an `isPrimary` flag marking a user's primary role. `AuthService.getUserRoles()` is the canonical way to resolve a user's primary role + full role list — reuse it rather than re-querying `UserRole` directly.
- Passwords are never sent/stored in plaintext but are also not hashed in the traditional sense: the frontend AES-encrypts the password client-side using `CryptographyService` (`aes-256-cbc`, format `<iv>:<cipher>` both base64, key derived via SHA-256 of `CRYPTO_SECRET_KEY`), and the backend stores that same cipherText in `User.passwordHash` verbatim, decrypting only to compare/validate. Do not add a second hashing layer (e.g. bcrypt) on top without understanding this is a deliberate two-way scheme, not a hash — `bcrypt` is a dependency but is currently unused in this flow.
- OTP flow (`src/modules/master/auth/otp/otp.service.ts`) backs email verification, resend, and forgot-password: one active (`isUsed: false`) OTP per `(userId, purpose)`, 6-digit numeric, expiring via `OTP_EXPIRES_IN_MINUTES`, capped at 5 attempts. `OtpPurpose` enum distinguishes `REGISTER` vs `FORGOT_PASSWORD` flows. Forgot-password's `changePassword` step requires a *recent* verified OTP within `OTP_RESET_SESSION_MINUTES` (checked via `assertForgotPasswordVerified`), not just "verified ever."
- `OtpService` is exported from `AuthModule` for reuse by other modules (e.g. `RegisterModule` uses it directly to send the post-registration verification email) — don't duplicate OTP logic in new modules, import `AuthModule`/inject `OtpService` instead.

### Registration flow

`RegisterModule`/`RegisterService` orchestrates creating a `User` + primary `UserRole` + profile (`CustomerProfile` or `VendorProfile`) inside a single TypeORM transaction (`DataSource.transaction`), keyed off hardcoded role IDs (`ROLE_ID_CUSTOMER = 2`, `ROLE_ID_VENDOR = 3` — these assume seed data, not dynamic lookup by name). Sending the post-registration OTP happens *after* the transaction commits and its failure is swallowed (logged, not thrown) so a flaky mail server never rolls back a successful registration.

### Entities

Entities use snake_case DB columns via explicit `name:` mappings on `@Column`, camelCase TS properties, and all live in the Postgres `master` schema (`@Entity({ name: '...', schema: 'master' })`). Soft-delete-style `deletedAt`/`active` flags and `createdAt/createdBy/modifiedAt/modifiedBy` (or `updatedAt/updatedBy` — naming is inconsistent between entities, check the specific entity) audit columns are set manually in service code, not via TypeORM subscribers/decorators.

### Swagger

Swagger decorators are factored out of controllers into `decorators/<feature>-swagger.decorator.ts` files as composed decorator functions (e.g. `ApiFindAllRole()`), applied above each controller method. Follow this pattern for new endpoints rather than inlining `@ApiOperation`/`@ApiResponse` in the controller.
