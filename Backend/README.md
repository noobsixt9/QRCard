# QRCard Backend API

QR-based Digital Visiting Card backend — Node.js, Express, PostgreSQL, Prisma.

## Quick Start

### 1. Start database (Docker)

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
# Edit .env with your API keys (Google OAuth, Gemini, Resend optional)
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
Swagger docs: `http://localhost:5001/api-docs`  
Health check: `http://localhost:5001/health`

> **macOS note:** Port 5000 is often used by AirPlay Receiver. This project defaults to **5001** to avoid conflicts.

## Default Admin (seed)

| Field    | Value            |
|----------|------------------|
| Email    | admin@qrcard.com |
| Password | Admin@123        |

## API Routes

| Prefix          | Description              |
|-----------------|--------------------------|
| `/api/auth`     | Register, login, OAuth   |
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
| `npm test`        | Run Jest tests     |
| `npm run db:studio` | Prisma Studio    |

## Storage

- **Development:** MinIO (Docker) with local filesystem fallback
- **Production:** Cloudflare R2 — set `NODE_ENV=production`

## Team

Rajan Kshedal (Backend) · NCIT, Pokhara University
