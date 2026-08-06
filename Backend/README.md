# QRCard Backend API

QR-based Digital Visiting Card backend — Node.js, Express, Supabase PostgreSQL (via Prisma), Firebase Auth.

## Quick Start

### 1. Start local storage service (Docker)

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys (Firebase, Supabase, Gemini, Resend optional)
```

For Supabase + Prisma, use both database URLs:

- `DATABASE_URL`: transaction-mode pooler URL (runtime queries from the app)
- `DIRECT_URL`: session-mode URL (Prisma migrations and introspection)

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 4. Run migrations and seed

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start server

```bash
npm run dev
```

API: `http://localhost:5001`  
Health check: `http://localhost:5001/health`

> **macOS note:** Port 5000 is often used by AirPlay Receiver. This project defaults to **5001** to avoid conflicts.

## Default Admin (seed)

Create your admin user in Firebase first, then set `ADMIN_FIREBASE_UID` in `.env` and run seed.

## API Routes

| Prefix          | Description              |
|-----------------|--------------------------|
| `/api/auth`     | Firebase sync, current user |
| `/api/profile`  | Profile CRUD, avatar     |
| `/api/qr`       | Online/offline QR codes  |
| `/api/ai`       | Bio generator, suggestions |
| `/api/orders`   | Printing orders          |
| `/api/admin`    | Admin dashboard, vendors |

## Scripts

| Command           | Description        |
|-------------------|--------------------|
| `npm run dev`     | Start with nodemon |
| `npm start`       | Production start   |
| `npm run db:studio` | Prisma Studio    |

## Storage

- **Development:** MinIO (Docker) with local filesystem fallback
- **Production:** Cloudflare R2 — set `NODE_ENV=production`

## Team

Rajan Kshedal (Backend) · NCIT, Pokhara University
Sanchita 
Anisha
