# QRCard Backend — Complete Study Guide (From Zero)

> **Purpose:** Everything about this Node.js + Express backend — JavaScript basics, packages, folder structure, entry point, every file, every function, and how requests flow through the system.  
> **Author context:** Rajan Kshedal · QRCard Final Year Project · NCIT  
> **Read this** when preparing for viva, integration with frontend, or debugging.

---

## Table of Contents

1. [JavaScript Fundamentals Used in This Project](#1-javascript-fundamentals-used-in-this-project)
2. [What is Node.js?](#2-what-is-nodejs)
3. [npm and package.json](#3-npm-and-packagejson)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Entry Point — How the Server Starts](#5-entry-point--how-the-server-starts)
6. [app.js — The Express Application](#6-appjs--the-express-application)
7. [Environment Variables (.env)](#7-environment-variables-env)
8. [Every npm Package Explained](#8-every-npm-package-explained)
9. [Database — Prisma + PostgreSQL](#9-database--prisma--postgresql)
10. [Request Lifecycle (Full Flow)](#10-request-lifecycle-full-flow)
11. [Middleware Layer — Every File](#11-middleware-layer--every-file)
12. [Config Layer — Every File](#12-config-layer--every-file)
13. [Utils Layer — Every File](#13-utils-layer--every-file)
14. [Module Pattern (Routes → Controller → Service)](#14-module-pattern-routes--controller--service)
15. [Auth Module](#15-auth-module)
16. [Profile Module](#16-profile-module)
17. [QR Code Module](#17-qr-code-module)
18. [AI Module](#18-ai-module)
19. [Orders Module](#19-orders-module)
20. [Admin + Vendor Module](#20-admin--vendor-module)
21. [Docker Services](#21-docker-services)
22. [API Endpoints Quick Reference](#22-api-endpoints-quick-reference)
23. [Standard JSON Response Shapes](#23-standard-json-response-shapes)
24. [Common Viva Questions](#24-common-viva-questions)

---

## 1. JavaScript Fundamentals Used in This Project

This backend uses **CommonJS** (not ES modules). That means:

```js
// Import (load another file)
const express = require('express')

// Export (make available to other files)
module.exports = myFunction
```

### Function types you will see

| Type | Example in project | When used |
|------|-------------------|-----------|
| **Named function** | `async function register(req, res, next)` | Controllers, services |
| **Arrow function** | `(req, res, next) => { ... }` | Inline callbacks, `.map()` |
| **Async function** | `async function login()` | DB calls, file upload, AI API |
| **Higher-order function** | `function validate(schema) { return (req, res, next) => ... }` | Middleware factories |
| **IIFE** | Not used heavily | — |

### `async` / `await`

Database and external API calls are **asynchronous** (take time). You `await` them inside `async` functions:

```js
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })  // waits for DB
  // ... rest runs after DB responds
}
```

Without `await`, you'd get a Promise object instead of the actual user.

### Destructuring

```js
// Object destructuring — pull fields out
async function register({ email, username, password }) { ... }

// From req.user after auth middleware
const { id, username, role } = req.user

// Rest operator — copy object minus sensitive fields
const { password_hash, google_id, ...safeUser } = user
```

### Optional chaining (`?.`)

```js
profile?.full_name        // undefined if profile is null
profile?.avatar_url       // safe access
err.message?.includes()   // won't crash if message is undefined
```

### Spread operator (`...`)

```js
const payload = { ...data }                    // shallow copy
const merged = { ...existing, ...payload }     // merge objects
```

### Error throwing pattern

Services throw errors with a custom HTTP status:

```js
const err = new Error('Email already taken')
err.status = 409
throw err
```

The global `errorHandler` middleware catches these and sends JSON.

### `module.exports` vs single export

```js
// Export one thing (default)
module.exports = auth

// Export multiple named things
module.exports = { signToken, sanitizeUser }
```

---

## 2. What is Node.js?

**Node.js** runs JavaScript **outside the browser** — on your machine or server.

- **Browser JS:** DOM, `window`, buttons, React
- **Node.js JS:** files, HTTP servers, databases, `fs`, `process`

When you run `npm run dev`, Node executes `server.js`, which starts an HTTP server listening on a port (5001). When a client sends `GET /health`, Node receives it and your Express code responds.

### Key Node globals used here

| Global | What it is |
|--------|------------|
| `process.env` | Environment variables from `.env` |
| `__dirname` | Current file's directory path |
| `require()` | Load a module |
| `module.exports` | Export from a module |

---

## 3. npm and package.json

**npm** = Node Package Manager. Installs libraries listed in `package.json`.

### Scripts (commands you run)

| Command | What it does |
|---------|--------------|
| `npm install` | Install all dependencies into `node_modules/` |
| `npm run dev` | Start server with **nodemon** (auto-restart on file change) |
| `npm start` | Start server with plain `node` (production) |
| `npm test` | Run Jest tests |
| `npx prisma migrate dev` | Apply database migrations |
| `npx prisma db seed` | Run seed script (creates admin user) |
| `npx prisma studio` | Visual database browser |

### Dependencies vs devDependencies

- **dependencies:** Needed at runtime (express, prisma, bcrypt)
- **devDependencies:** Only for development (jest, nodemon, eslint)

---

## 4. Project Folder Structure

```
Backend/
├── server.js                 ← ENTRY POINT (starts HTTP server)
├── package.json              ← Dependencies and scripts
├── .env                        ← Secrets (not in git)
├── .env.example                ← Template for .env
├── docker-compose.yml          ← Postgres + MinIO containers
│
├── prisma/
│   ├── schema.prisma           ← Database models (source of truth)
│   ├── seed.js                 ← Creates default admin user
│   └── migrations/             ← SQL history of schema changes
│
├── uploads/
│   └── avatars/                ← Local avatar fallback storage
│
├── tests/
│   ├── auth.test.js
│   ├── utils.test.js
│   └── uuid.test.js
│
└── src/
    ├── app.js                  ← Express app setup (middleware + routes)
    │
    ├── config/                 ← Third-party client setup
    │   ├── db.js               ← Prisma client
    │   ├── gemini.js           ← Google AI client
    │   ├── storage.js          ← S3/MinIO client
    │   ├── mailer.js           ← Resend email client
    │   ├── passport.js         ← Google OAuth strategy
    │   ├── swagger.js          ← API docs spec loader
    │   └── openapi.spec.js       ← Full OpenAPI path definitions
    │
    ├── middleware/             ← Runs BEFORE route handlers
    │   ├── auth.js
    │   ├── requireRole.js
    │   ├── validate.js
    │   ├── upload.js
    │   ├── rateLimiter.js
    │   ├── errorHandler.js
    │   └── notFound.js
    │
    ├── utils/                  ← Reusable helper functions
    │   ├── jwt.js
    │   ├── uuid.js
    │   ├── completeness.js
    │   ├── vcard.js
    │   ├── storageService.js
    │   ├── pdf.js
    │   ├── pagination.js
    │   ├── mailService.js
    │   └── emailTemplates.js
    │
    └── modules/                ← Feature modules
        ├── auth/
        ├── profile/
        ├── qrcode/
        ├── ai/
        ├── orders/
        ├── admin/
        └── vendor/
```

### Why this structure?

Each **module** follows the same pattern:

```
module/
├── *.routes.js      → Defines URLs and wires middleware
├── *.controller.js  → HTTP layer (req/res), calls service
├── *.service.js     → Business logic + database queries
└── *.schema.js      → Zod validation rules (optional)
```

This is **layered architecture**: HTTP concerns stay in controller, business rules in service, DB access in service via Prisma.

---

## 5. Entry Point — How the Server Starts

### File: `server.js`

```js
require('dotenv').config()          // 1. Load .env into process.env

const app = require('./src/app')    // 2. Import configured Express app

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {           // 3. Start listening for HTTP requests
  console.log(`QRCard API running on http://localhost:${PORT}`)
})
```

**Step by step:**

1. **dotenv** reads `.env` file and puts values into `process.env.PORT`, `process.env.JWT_SECRET`, etc.
2. **require('./src/app')** loads `app.js`, which registers all middleware and routes. Nothing listens yet — it just builds the app.
3. **app.listen(PORT)** opens a TCP port. From this moment, HTTP requests can arrive.

**nodemon** (`npm run dev`) watches files and re-runs `server.js` when you save changes.

---

## 6. app.js — The Express Application

### What is Express?

**Express** is a minimal web framework for Node.js. It gives you:

- `app.get()`, `app.post()`, etc. — route handlers
- `app.use()` — middleware chain
- `req` (request) and `res` (response) objects

### Middleware order matters

Middleware runs **top to bottom**. First match wins for routes; middleware runs for every request in order.

```
Incoming HTTP Request
        │
        ▼
┌───────────────────────────────────────┐
│ 1. helmet()          Security headers │
│ 2. cors()            Allow frontend   │
│ 3. express.json()    Parse JSON body  │
│ 4. express.urlencoded() Form data      │
│ 5. morgan('dev')     Log requests     │
│ 6. passport.initialize() OAuth ready  │
│ 7. generalLimiter    Rate limit 100/15m│
│ 8. /uploads static   Serve local files│
├───────────────────────────────────────┤
│ GET /health                           │
│ /api-docs        Swagger UI            │
│ /api/auth        auth routes           │
│ /api/profile     profile routes        │
│ /api/qr          QR routes             │
│ /api/ai          AI routes             │
│ /api/orders      order routes          │
│ /api/admin       admin routes          │
├───────────────────────────────────────┤
│ notFound()       404 if no route match │
│ errorHandler()   Catch all errors      │
└───────────────────────────────────────┘
        │
        ▼
   JSON Response
```

### Route mounting

```js
app.use('/api/auth', authRoutes)
```

This means: everything in `auth.routes.js` is prefixed with `/api/auth`.

So `router.post('/register', ...)` becomes `POST /api/auth/register`.

---

## 7. Environment Variables (.env)

Secrets and config live in `.env`, **never committed to git**.

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (5001 on macOS to avoid AirPlay conflict) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key to sign/verify tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (optional) |
| `GEMINI_API_KEY` | AI features (optional) |
| `RESEND_API_KEY` | Email sending (optional) |
| `MINIO_*` | Local file storage (dev) |
| `R2_*` | Cloudflare R2 storage (production) |
| `APP_BASE_URL` | Backend URL |
| `CLIENT_BASE_URL` | Frontend URL (for CORS + QR links) |

Access anywhere: `process.env.JWT_SECRET`

---

## 8. Every npm Package Explained

### Runtime dependencies

| Package | What it does in QRCard |
|---------|----------------------|
| **express** | HTTP server framework — routes, middleware, req/res |
| **@prisma/client** | Generated DB client — type-safe SQL queries |
| **prisma** (dev) | CLI for migrations and schema |
| **bcrypt** | Hash passwords (one-way, slow by design) |
| **jsonwebtoken** | Create and verify JWT auth tokens |
| **zod** | Validate request body shape at runtime |
| **dotenv** | Load `.env` file |
| **cors** | Allow frontend (`localhost:3000`) to call API |
| **helmet** | Set security HTTP headers |
| **morgan** | Log `GET /api/profile 200 45ms` to console |
| **express-rate-limit** | Block too many requests (anti-abuse) |
| **multer** | Parse `multipart/form-data` file uploads |
| **@aws-sdk/client-s3** | Upload/delete files on MinIO or Cloudflare R2 |
| **qrcode** | Generate QR code as base64 PNG data URL |
| **pdfkit** | Generate print-ready business card PDF |
| **@google/generative-ai** | Call Gemini API for bio + suggestions |
| **resend** | Send transactional emails |
| **passport** | Authentication middleware framework |
| **passport-google-oauth20** | Google login strategy for Passport |
| **swagger-ui-express** | Serve interactive API docs at `/api-docs` |
| **swagger-jsdoc** | Listed in package.json; spec is hand-written in `openapi.spec.js` |

### Dev dependencies

| Package | Purpose |
|---------|---------|
| **nodemon** | Auto-restart server on file save |
| **jest** | Test runner |
| **supertest** | HTTP assertions in tests |
| **eslint** | Code linting |

---

## 9. Database — Prisma + PostgreSQL

### What is Prisma?

**ORM** = Object-Relational Mapping. You write JavaScript instead of raw SQL:

```js
// Instead of: SELECT * FROM "User" WHERE email = $1
const user = await prisma.user.findUnique({ where: { email } })
```

### schema.prisma — 5 models

```
User ────── Profile        (1:1)
  │
  ├── QRCode[]             (1:many, max 2: ONLINE + OFFLINE)
  ├── PrintingOrder[]      (1:many)
  │
Vendor ──── PrintingOrder[] (1:many, optional)
```

### Enums

- **Role:** `USER` | `ADMIN`
- **QRType:** `ONLINE` | `OFFLINE`
- **OrderStatus:** `PENDING` | `CONFIRMED` | `COMPLETED` | `CANCELLED`

### UUID primary keys

All `id` fields are **UUID strings** (not auto-increment integers):

```prisma
id String @id @default(uuid()) @db.Uuid
```

PostgreSQL generates them with `gen_random_uuid()`.

### Key Prisma operations used

| Method | Example |
|--------|---------|
| `findUnique` | Find by unique field (email, id) |
| `findFirst` | Find first match with filters |
| `findMany` | List with pagination |
| `create` | Insert new row |
| `update` | Update existing row |
| `upsert` | Update if exists, create if not |
| `delete` | Remove row |
| `count` | Count rows |
| `updateMany` | Bulk update (scan_count increment) |

### Migrations

```bash
npx prisma migrate dev --name init   # Create + apply migration
npx prisma generate                  # Regenerate client after schema change
npx prisma db seed                   # Run seed.js
```

### seed.js

Creates default admin:

- Email: `admin@qrcard.com`
- Password: `Admin@123`
- Role: `ADMIN`

Uses `upsert` — safe to run multiple times.

---

## 10. Request Lifecycle (Full Flow)

**Example: `PUT /api/profile` with JWT token**

```
1. Client sends:
   PUT http://localhost:5001/api/profile
   Authorization: Bearer eyJhbGci...
   Body: { "full_name": "Rajan" }

2. helmet, cors, express.json, morgan, rateLimiter run

3. Express matches app.use('/api/profile', profileRoutes)

4. profile.routes.js:
   auth middleware → verifies JWT, sets req.user = { id, username, role }
   requireRole('USER', 'ADMIN') → checks role
   validate(updateProfileSchema) → Zod checks body
   profileController.updateProfile

5. profile.controller.js:
   calls profileService.updateProfile(req.user.id, req.body)
   sends res.status(200).json({ success: true, data: profile })

6. profile.service.js:
   merges data, calculates completeness score
   prisma.profile.upsert(...)
   returns updated profile

7. If error thrown anywhere → errorHandler sends JSON error
```

---

## 11. Middleware Layer — Every File

Middleware = function with signature `(req, res, next)`.

### `auth.js`

**Purpose:** Protect routes — verify JWT Bearer token.

**Flow:**
1. Read `Authorization: Bearer <token>` header
2. `jwt.verify(token, JWT_SECRET)` → decode payload `{ id, username, role }`
3. DB lookup: is user still active?
4. Attach `req.user` and call `next()`
5. On failure: 401 or 403 JSON response

### `requireRole.js`

**Purpose:** RBAC — restrict by role.

```js
requireRole('ADMIN')           // admin only
requireRole('USER', 'ADMIN')   // both allowed
```

Returns factory function — must run **after** `auth.js`.

### `validate.js`

**Purpose:** Zod validation factory.

```js
validate(registerSchema)        // validates req.body
validate(schema, 'query')       // validates req.query
```

On failure: 400 with field-level errors array.

### `upload.js`

**Purpose:** Multer config for avatar uploads.

- Stores file in **memory** as buffer (`memoryStorage`)
- Max 2MB
- Only JPEG, PNG, WebP
- File available as `req.file` in controller

### `rateLimiter.js`

| Limiter | Limit | Applied to |
|---------|-------|------------|
| `generalLimiter` | 100 / 15 min | All routes (global in app.js) |
| `authLimiter` | 20 / 15 min | `/api/auth/register`, `/login` |
| `aiLimiter` | 10 / 15 min | All `/api/ai/*` routes |

### `errorHandler.js`

**Purpose:** Last middleware — catches all errors.

Maps:
- `ZodError` → 400
- Prisma `P2002` (unique violation) → 409
- Prisma `P2025` (not found) → 404
- JWT errors → 401
- Multer file size → 400
- `err.status` if set → that status
- Else → 500

### `notFound.js`

Returns `{ success: false, message: "Route not found" }` for unknown URLs.

---

## 12. Config Layer — Every File

### `db.js`

```js
const prisma = new PrismaClient()
module.exports = prisma
```

**Singleton** — one DB connection pool for entire app.

### `gemini.js` — `getGeminiModel()`

- Returns `null` if no `GEMINI_API_KEY`
- Otherwise lazy-loads `gemini-1.5-flash` model
- Used by AI module

### `storage.js`

Exports `{ s3, BUCKET, PUBLIC_URL, isProduction }`.

- **development:** points to MinIO (`localhost:9000`)
- **production:** points to Cloudflare R2

Both use same AWS S3 SDK (`@aws-sdk/client-s3`).

### `mailer.js` — `getResend()`

Lazy-loads Resend email client. Returns `null` if no API key.

### `passport.js`

Configures **Google OAuth 2.0** strategy (only if Google credentials exist).

**Key functions:**
- `slugify(text)` — convert display name to username-safe string
- `generateUniqueUsername(baseName)` — ensure username is unique in DB

**OAuth flow logic:**
1. Find user by `google_id`
2. Else find by `email` → link `google_id`
3. Else create new user + profile from Google data
4. Call `done(null, user)` for Passport

### `swagger.js` + `openapi.spec.js`

`buildSpec()` returns full OpenAPI 3.0 document with all 28 endpoints. Served at `/api-docs`.

---

## 13. Utils Layer — Every File

### `jwt.js`

| Function | Purpose |
|----------|---------|
| `signToken(user)` | Create JWT with `{ id, username, role }`, expires in 7d |
| `sanitizeUser(user)` | Strip sensitive fields before sending to client |

### `uuid.js`

| Function | Purpose |
|----------|---------|
| `parseUuid(value, fieldName)` | Validate UUID string; throw 400 if invalid |
| `uuidSchema` | Zod UUID validator |

### `completeness.js`

| Function | Purpose |
|----------|---------|
| `calculateCompleteness(profile)` | Score 0–100 + list of missing fields |
| `getCompletenessLevel(score)` | `Incomplete` / `Moderate` / `Good` / `Complete` |

**Scoring:**

| Field | Points |
|-------|--------|
| full_name | 15 |
| job_title | 10 |
| company | 10 |
| bio | 20 |
| phone | 10 |
| public_email | 10 |
| avatar_url | 10 |
| website | 5 |
| social_links (any) | 10 |

### `vcard.js`

| Function | Purpose |
|----------|---------|
| `escapeVCard(value)` | Escape `;`, `,`, `\`, newlines per vCard 3.0 spec |
| `parseName(fullName)` | Split into family/given for `N:` field |
| `buildVCard(profile, username)` | Build full vCard string for offline QR |

### `storageService.js`

| Function | Purpose |
|----------|---------|
| `uploadAvatar(userId, file)` | Upload to S3/MinIO; fallback to local `uploads/avatars/` |
| `deleteAvatar(url)` | Delete from S3 and local |
| `extractKeyFromUrl(url)` | Parse storage key from URL |

### `pdf.js`

| Function | Purpose |
|----------|---------|
| `dataUrlToBuffer(dataUrl)` | Convert base64 QR image to Buffer |
| `fetchImageBuffer(url)` | Download avatar image for PDF |
| `generateCardPDF(profile, qrDataUrl, designConfig)` | 85×54mm business card PDF as Buffer |

### `pagination.js`

| Function | Purpose |
|----------|---------|
| `parsePagination(query, defaultLimit, maxLimit)` | Parse `?page=1&limit=10` → `{ page, limit, skip }` |
| `paginationMeta(total, page, limit)` | `{ total, page, limit, totalPages }` |

### `mailService.js`

| Function | Purpose |
|----------|---------|
| `sendOrderConfirmationEmail(order, user, pdfBuffer)` | Email user when order confirmed |
| `sendVendorOrderEmail(order, user, vendor, pdfBuffer)` | Email vendor with PDF attachment |

### `emailTemplates.js`

| Function | Purpose |
|----------|---------|
| `orderReceiptEmail(order, user)` | HTML string for user receipt |
| `vendorOrderEmail(order, user, vendor)` | HTML string for vendor notification |

---

## 14. Module Pattern (Routes → Controller → Service)

### routes.js — Traffic director

```js
router.post('/register', authLimiter, validate(registerSchema), authController.register)
//            URL path    middleware chain ──────────────────────► handler
```

### controller.js — HTTP adapter

- Reads `req.body`, `req.params`, `req.user`
- Calls service
- Sends `res.status().json()`
- Never contains business logic or direct DB calls
- Always wraps in `try/catch` → `next(err)`

### service.js — Business logic

- Validates business rules (email taken, order status transition)
- Calls Prisma
- Throws errors with `err.status`
- Returns plain data (no `res`)

### schema.js — Input validation

Zod schemas define exactly what the API accepts.

---

## 15. Auth Module

**Base path:** `/api/auth`

### Files

| File | Role |
|------|------|
| `auth.routes.js` | Route definitions |
| `auth.controller.js` | HTTP handlers |
| `auth.service.js` | Register, login, getMe logic |
| `auth.schema.js` | Zod for register/login body |

### Endpoints

| Method | Path | Auth | What happens |
|--------|------|------|--------------|
| POST | `/register` | No | Create user + empty profile + return JWT |
| POST | `/login` | No | Verify password + return JWT |
| GET | `/me` | Yes | Return current user info |
| GET | `/google` | No | Redirect to Google consent |
| GET | `/google/callback` | No | Exchange code → JWT → redirect frontend |

### `auth.service.js` functions

**`register({ email, username, password })`**
1. Check email/username not taken → 409
2. `bcrypt.hash(password, 12)` → password_hash
3. `prisma.user.create` with nested `profile: { create: {} }`
4. `signToken(user)` → return `{ token, user }`

**`login({ email, password })`**
1. Find by email → 401 if missing
2. If `password_hash` is null → 400 "sign in with Google"
3. If `!is_active` → 403
4. `bcrypt.compare` → 401 if wrong
5. Return token

**`getMe(userId)`**
1. Fetch user from DB
2. Check active → 403 if deactivated
3. Return safe user object

### JWT payload

```json
{ "id": "uuid-string", "username": "rajan", "role": "USER" }
```

Token sent as: `Authorization: Bearer <token>`

---

## 16. Profile Module

**Base path:** `/api/profile`

### Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | Yes | Own full profile |
| PUT | `/` | Yes | Partial update |
| POST | `/avatar` | Yes | Upload image (multipart) |
| DELETE | `/avatar` | Yes | Remove avatar |
| GET | `/public/:username` | **No** | Public card page data |

### `profile.service.js` highlights

**`updateProfile(userId, data)`**
- Upsert profile row
- Recalculate `completeness_score` on every save

**`getPublicProfile(username)`**
- Find user by username
- Return 404 if inactive (don't reveal deactivation)
- Fire-and-forget: increment `scan_count` on ONLINE QR
- Return only public-safe fields (no role, no password)

---

## 17. QR Code Module

**Base path:** `/api/qr`

### Online vs Offline

| Type | QR contains | Needs internet to scan? |
|------|-------------|------------------------|
| **ONLINE** | URL: `http://localhost:3000/u/username` | Yes (opens web page) |
| **OFFLINE** | vCard 3.0 text string | No (saves contact to phone) |

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/online` | Generate/regenerate online QR |
| POST | `/offline` | Generate/regenerate offline vCard QR |
| GET | `/` | Get both QRs + profile_updated_at |
| DELETE | `/:type` | Delete ONLINE or OFFLINE QR |

### `qr.service.js`

Uses `qrcode` npm package:

```js
const qr_data_url = await QRCode.toDataURL(urlOrVcard, { width: 300, margin: 2 })
// Returns: "data:image/png;base64,iVBORw0KGgo..."
```

**Upsert:** Each user can have exactly one ONLINE and one OFFLINE QR (`@@unique([user_id, type])`).

**Stale offline QR:** Frontend compares `profile.updated_at` vs `qr.updated_at`.

---

## 18. AI Module

**Base path:** `/api/ai`  
**Rate limit:** 10 requests / 15 minutes

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/bio` | Gemini generates professional bio |
| GET | `/completeness` | Score + AI improvement suggestions |

### `ai.service.js`

**`generateBio(userId)`**
- Requires `full_name` + `job_title` in profile
- Builds prompt → calls Gemini → returns `{ bio }`
- 502 if Gemini unavailable

**`getCompletenessSuggestions(userId)`**
- Uses local `calculateCompleteness` for score
- If score = 100 → skip AI
- Else ask Gemini for 3 numbered suggestions
- Falls back to generic suggestions if no API key

---

## 19. Orders Module

**Base path:** `/api/orders`

### Order status machine

```
PENDING ──► CONFIRMED ──► COMPLETED
   │            │
   ▼            ▼
CANCELLED    CANCELLED
```

| Transition | Who |
|------------|-----|
| PENDING → CANCELLED | User or Admin |
| PENDING → CONFIRMED | Admin only |
| CONFIRMED → COMPLETED | Admin only |
| CONFIRMED → CANCELLED | Admin only |

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/` | Place order (requires QR exists) |
| GET | `/` | List own orders (paginated) |
| GET | `/:id` | Single order detail |
| PATCH | `/:id/cancel` | Cancel if PENDING |

### `createOrder` rule

Must already have generated QR of requested type (`ONLINE` or `OFFLINE`) or returns 400.

---

## 20. Admin + Vendor Module

**Base path:** `/api/admin`  
**All routes require:** `auth` + `requireRole('ADMIN')`

### Dashboard — `GET /dashboard`

Returns: total users, active users, order counts by status, 5 recent orders.

### User management

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users` | List all users + completion % |
| GET | `/users/:id` | Full user + profile + orders |
| PATCH | `/users/:id/status` | `{ "is_active": false }` |

Deactivated users fail on next API call (auth middleware checks DB).

### Order management

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/orders` | All orders (filter by status, vendor) |
| GET | `/orders/:id` | Full order detail |
| PATCH | `/orders/:id/status` | Update status + email PDF on CONFIRMED |
| POST | `/orders/:id/send-to-vendor` | Assign vendor + email PDF |

### Vendor CRUD — `/vendors`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/vendors` | Create print vendor |
| GET | `/vendors` | List active vendors |
| GET | `/vendors/:id` | Vendor + assigned orders |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Soft delete (`is_active = false`) |

**Note:** Vendors are **contacts**, not login users. Admin emails them order PDFs.

---

## 21. Docker Services

```bash
docker compose up -d
```

| Container | Port | Purpose |
|-----------|------|---------|
| `qrcard-postgres` | 5432 | PostgreSQL database |
| `qrcard-minio` | 9000 (API), 9001 (console) | S3-compatible file storage |

**Connection string:** `postgresql://qrcard:qrcard@localhost:5432/qrcard`

---

## 22. API Endpoints Quick Reference

```
GET    /health
GET    /api-docs
GET    /api-docs.json

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/google
GET    /api/auth/google/callback

GET    /api/profile
PUT    /api/profile
POST   /api/profile/avatar
DELETE /api/profile/avatar
GET    /api/profile/public/:username

POST   /api/qr/online
POST   /api/qr/offline
GET    /api/qr
DELETE /api/qr/:type

POST   /api/ai/bio
GET    /api/ai/completeness

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/cancel

GET    /api/admin/dashboard
GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
POST   /api/admin/orders/:id/send-to-vendor
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/status
POST   /api/admin/vendors
GET    /api/admin/vendors
GET    /api/admin/vendors/:id
PUT    /api/admin/vendors/:id
DELETE /api/admin/vendors/:id
```

---

## 23. Standard JSON Response Shapes

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

**Success with pagination:**
```json
{
  "success": true,
  "data": [ ],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

**Validation error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email address" }]
}
```

**General error:**
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

## 24. Common Viva Questions

**Q: What is the entry point?**  
A: `server.js` loads `.env`, imports `app.js`, calls `app.listen(PORT)`.

**Q: How does authentication work?**  
A: Login returns JWT. Client sends `Authorization: Bearer <token>`. `auth.js` middleware verifies signature, checks user is active, sets `req.user`.

**Q: Why bcrypt cost 12?**  
A: Slow hashing — makes brute-force attacks expensive. Cost factor = 2^12 iterations.

**Q: Online vs offline QR?**  
A: Online encodes a URL to the web profile (always up to date). Offline encodes vCard data at generation time (works without internet but can become stale).

**Q: How is admin protected?**  
A: Same JWT auth + `requireRole('ADMIN')` on all `/api/admin/*` routes.

**Q: What happens when admin deactivates a user?**  
A: `is_active = false`. Next API call: auth middleware DB check returns 403. Public profile returns 404.

**Q: Why UUID instead of serial IDs?**  
A: Non-guessable, safe to expose in URLs, no enumeration attacks, works across distributed systems.

**Q: What is Prisma?**  
A: Type-safe ORM — JavaScript API that generates SQL for PostgreSQL. Schema in `schema.prisma`, migrations track changes.

**Q: How do file uploads work?**  
A: Multer buffers file in memory → `storageService` uploads to MinIO/R2 → URL saved in `profile.avatar_url`. Local fallback if MinIO is down.

---

## How to Run (Quick Reference)

```bash
# 1. Start database
docker compose up -d

# 2. Install + migrate
npm install
npx prisma migrate dev
npx prisma db seed

# 3. Start server
npm run dev

# 4. Test
curl http://localhost:5001/health
```

**Admin login:** `admin@qrcard.com` / `Admin@123`  
**Swagger:** http://localhost:5001/api-docs

---

*Document version: 1.0 · QRCard Backend Complete Guide · June 2026*
