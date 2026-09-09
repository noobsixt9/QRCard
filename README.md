# QRCard — QR-Based Digital Visiting Card Platform

> **BCA Final Year Project** · Nepal College of Information Technology (NCIT) · Pokhara University

A full-stack web application that lets professionals create a digital visiting card, generate scannable QR codes (online profile link + offline vCard), design and order physical printed cards, and manage everything from a polished dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Team](#team)

---

## Overview

QRCard bridges the physical and digital networking world. Users sign up, build a rich digital profile, generate two kinds of QR codes, design a physical visiting card in a live studio, and place a print order — all from a single platform. Admins manage users, orders, vendors, and design requests from a dedicated panel.

---

## Live Demo

|                        | URL                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Frontend**           | [https://qrcard.dev](https://qrcard.dev)                                                         |
| **Backend API**        | [https://backend-onrender-qbu7.onrender.com/api](https://backend-onrender-qbu7.onrender.com/api) |
| **Admin Panel**        | [https://qrcard.dev/admin](https://qrcard.dev/admin)                                             |
| **API Docs** | [documenter.getpostman.com/view/44398656/2sBY4VLHjT](https://documenter.getpostman.com/view/44398656/2sBY4VLHjT) |

---

## Features

### User Features

- **Email + Google OAuth registration** with OTP email verification and reCAPTCHA v2
- **Digital Profile** — name, job title, company, bio, phone, email, website, address, social links, avatar upload
- **Dual QR Code system**
  - _Online QR_ — links to live public profile page; scan count tracked
  - _Offline vCard QR_ — embeds full contact in QR; works without internet
- **AI Bio Generator** — Groq AI (llama-3.3-70b-versatile) writes a professional bio from your profile data
- **Profile completeness scoring** (0–100%) with AI-powered improvement suggestions
- **Card Design Studio** — customize accent colour, font, layout, corners; live business-card preview (3.5×2 inch ratio)
- **Print Order system** — select quantity, paper type, payment method (COD / eSewa / Khalti), delivery address
- **Order tracking** — Pending → Confirmed → Processing → Delivered → Completed progress bar
- **Public Profile page** — shareable URL at `qrcard.dev/u/username`
- **Settings** — change password, dark/light mode, public profile toggle (hides profile from QR scan)
- **Forgot password** via email OTP with 15-minute reset token

### Admin Features

- **Dashboard** — total users, active users, orders breakdown, recent orders
- **Users management** — view, block/unblock, create new user/admin, profile completion bar
- **Profiles management** — activate/deactivate public profiles
- **Orders management** — full order lifecycle, assign to vendor (auto-sets PROCESSING), status transitions with confirmation emails
- **Design Requests** — view card design configs, approve/reject orders
- **Vendors** — CRUD vendor records, vendor assignment for order fulfilment
- **Settings** — admin profile, password change, dark mode, profile visibility

### Email Notifications

- **Signup OTP** — styled HTML email with 6-digit code
- **Password Reset OTP** — separate styled template, 10-minute expiry
- **Order Confirmation** — PDF card preview attached
- **Vendor Assignment** — PDF preview + editable SVG card design attached

---

## Tech Stack

### Frontend

| Technology                 | Purpose                         |
| -------------------------- | ------------------------------- |
| React 19 + Vite 8          | UI framework and build tool     |
| React Router DOM v7        | Client-side routing             |
| `@react-oauth/google`      | Google One-Tap / Sign-In button |
| Custom CSS (design tokens) | Theming, dark/light mode        |
| reCAPTCHA v2               | Bot protection on auth forms    |

### Backend

| Technology                     | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| Node.js ≥ 20 + Express 4       | REST API server                               |
| Prisma ORM + PostgreSQL        | Database (Supabase hosted)                    |
| JWT + bcrypt                   | Authentication & password hashing             |
| Firebase Admin SDK             | Optional Firebase token verification          |
| Groq SDK (llama-3.3-70b)       | AI bio generation                             |
| PDFKit                         | Print-ready PDF card generation               |
| Custom SVG generator           | Editable vector card for vendors              |
| Resend                         | Transactional email (OTP, order confirmation) |
| Multer + Cloudflare R2 / MinIO | Avatar file upload and storage                |
| Helmet + CORS                  | Security headers                              |
| express-rate-limit             | AI endpoint rate limiting                     |
| Zod                            | Request schema validation                     |


###Figma Design
View Figma Design : https://www.figma.com/design/ssPPyvVKw1H0r52zR8BTiG/QRCard-UI-UX-Design?node-id=1-2&t=6AshiuHhGSxup6zg-1

### Infrastructure

| Service       | Usage                       |
| ------------- | --------------------------- |
| Supabase      | PostgreSQL database (cloud) |
| Render        | Backend hosting             |
| Netlify       | Frontend hosting            |
| Cloudflare R2 | Production file storage     |
| Resend        | Email delivery              |

---

## Project Structure

```
QRCard/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Firebase admin seed
│   │   └── create-admin.js        # Email/password admin creator
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client
│   │   │   ├── groq.js            # Groq AI client
│   │   │   ├── mailer.js          # Resend email client
│   │   │   ├── recaptcha.js       # reCAPTCHA v2 verifier
│   │   │   └── storage.js         # R2 / MinIO storage
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT + Firebase token verification
│   │   │   ├── requireRole.js     # Role-based access control
│   │   │   ├── validate.js        # Zod request validation
│   │   │   └── rateLimiter.js     # AI endpoint rate limiter
│   │   ├── modules/
│   │   │   ├── auth/              # Register, login, OTP, password reset
│   │   │   ├── profile/           # Profile CRUD, avatar upload
│   │   │   ├── qrcode/            # Online/offline QR generation
│   │   │   ├── orders/            # Print order lifecycle
│   │   │   ├── ai/                # Bio generation, completeness
│   │   │   ├── admin/             # Admin dashboard, user/order/vendor mgmt
│   │   │   └── vendor/            # Vendor service
│   │   └── utils/
│   │       ├── emailTemplates.js  # HTML email templates
│   │       ├── mailService.js     # Email sending functions
│   │       ├── pdf.js             # PDFKit card generator
│   │       ├── cardSvg.js         # SVG card generator for vendors
│   │       ├── completeness.js    # Profile score calculator
│   │       └── vcard.js           # vCard string builder
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── postman_collection.json    # Postman API collection
│
└── Frontend/
    ├── src/
    │   ├── Component/
    │   │   ├── Header.jsx          # Public navigation, theme toggle
    │   │   ├── Footer.jsx          # Public footer
    │   │   ├── ConfirmModal.jsx    # Reusable confirm dialog
    │   │   ├── RecaptchaWidget.jsx # reCAPTCHA v2 widget
    │   │   ├── UserGuard.jsx       # Route guard for user pages
    │   │   ├── User/Sidebar.jsx    # User dashboard sidebar
    │   │   └── Admin/
    │   │       ├── AdminSidebar.jsx
    │   │       └── AdminGuard.jsx  # Route guard for admin pages
    │   ├── Pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── OTPVerification.jsx
    │   │   ├── PublicProfile.jsx
    │   │   ├── User/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── DigitalProfile.jsx
    │   │   │   ├── QRCodes.jsx
    │   │   │   ├── AIBio.jsx
    │   │   │   ├── CardDesign.jsx
    │   │   │   ├── Orders.jsx
    │   │   │   ├── PrintingOrders.jsx
    │   │   │   └── Settings.jsx
    │   │   └── Admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── Users.jsx
    │   │       ├── Profiles.jsx
    │   │       ├── Orders.jsx
    │   │       ├── DesignRequests.jsx
    │   │       ├── Vendors.jsx
    │   │       └── Settings.jsx
    │   ├── CSS/                    # Per-page CSS (design token system)
    │   ├── config/api.js           # API URL + auth headers helper
    │   └── utils/
    │       ├── auth.js             # Session helpers
    │       └── cache.js            # sessionStorage TTL cache
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 9
- **PostgreSQL** database (local or Supabase)
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)
- A **Resend API key** — free at [resend.com](https://resend.com)
- A **Google reCAPTCHA v2** site/secret key pair — [google.com/recaptcha](https://www.google.com/recaptcha/admin)

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/QRCard.git
cd QRCard/Backend

# 2. Install dependencies
npm install

# 3. Copy the example environment file
cp .env.example .env
```

Edit `.env` — fill in all required values (see [Environment Variables](#environment-variables) below).

```bash
# 4. Push the database schema (creates all tables)
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. Create the first admin account
node prisma/create-admin.js
# Default: admin@qrcard.com / Admin@123456
# Override with ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_USERNAME in .env

# 7. Start the development server
npm run dev
# API is available at http://localhost:5001
```

**Verify the server is running:**

```bash
curl http://localhost:5001/health
# → { "status": "ok", "timestamp": "..." }
```

---

### Frontend Setup

```bash
cd ../Frontend

# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env   # or create manually
```

Add to `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v2_site_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

```bash
# 3. Start the dev server
npm run dev
# Frontend at http://localhost:5173

# 4. Build for production
npm run build
```

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable                | Required | Description                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `PORT`                  | No       | Server port (default `5001`)                                                                                  |
| `NODE_ENV`              | No       | `development` or `production`                                                                                 |
| `DATABASE_URL`          | **Yes**  | PostgreSQL connection string. For Supabase with connection pool: append `?connection_limit=5&pool_timeout=10` |
| `DIRECT_URL`            | No       | Direct Supabase URL for migrations (no pool params)                                                           |
| `JWT_SECRET`            | **Yes**  | Random string ≥ 32 characters                                                                                 |
| `JWT_EXPIRES_IN`        | No       | Token lifetime (default `7d`)                                                                                 |
| `GROQ_API_KEY`          | **Yes**  | Groq API key for AI bio generation — get free at [console.groq.com](https://console.groq.com)                 |
| `RESEND_API_KEY`        | **Yes**  | Resend API key for transactional emails                                                                       |
| `EMAIL_FROM`            | **Yes**  | Sender address (e.g. `noreply@yourdomain.com`)                                                                |
| `RECAPTCHA_SECRET_KEY`  | **Yes**  | Google reCAPTCHA v2 secret key                                                                                |
| `RECAPTCHA_SITE_KEY`    | No       | reCAPTCHA site key (for reference only; used by frontend)                                                     |
| `CLIENT_BASE_URL`       | **Yes**  | Frontend URL (e.g. `https://qrcard.dev`) — used in CORS and QR code URLs                                      |
| `APP_BASE_URL`          | No       | Backend URL (e.g. `https://your-api.onrender.com`)                                                            |
| `FIREBASE_PROJECT_ID`   | No       | Firebase Admin SDK — only needed if using Firebase Auth                                                       |
| `FIREBASE_CLIENT_EMAIL` | No       | Firebase Admin SDK                                                                                            |
| `FIREBASE_PRIVATE_KEY`  | No       | Firebase Admin SDK                                                                                            |
| `R2_ACCOUNT_ID`         | No       | Cloudflare R2 — for production file storage                                                                   |
| `R2_ACCESS_KEY_ID`      | No       | Cloudflare R2                                                                                                 |
| `R2_SECRET_ACCESS_KEY`  | No       | Cloudflare R2                                                                                                 |
| `R2_BUCKET_NAME`        | No       | Cloudflare R2 bucket (default `qrcard-uploads`)                                                               |
| `R2_PUBLIC_URL`         | No       | Cloudflare R2 public CDN URL                                                                                  |
| `MINIO_ENDPOINT`        | No       | MinIO endpoint for local dev (default `http://localhost:9000`)                                                |
| `MINIO_ACCESS_KEY`      | No       | MinIO access key (default `minioadmin`)                                                                       |
| `MINIO_SECRET_KEY`      | No       | MinIO secret key (default `minioadmin`)                                                                       |
| `MINIO_BUCKET_NAME`     | No       | MinIO bucket (default `qrcard-uploads`)                                                                       |

### Frontend (`Frontend/.env`)

| Variable                  | Required | Description                                                     |
| ------------------------- | -------- | --------------------------------------------------------------- |
| `VITE_API_URL`            | **Yes**  | Backend API base URL (e.g. `https://your-api.onrender.com/api`) |
| `VITE_RECAPTCHA_SITE_KEY` | **Yes**  | Google reCAPTCHA v2 **site** key (public)                       |
| `VITE_GOOGLE_CLIENT_ID`   | No       | Google OAuth Client ID for Google Sign-In button                |

---

## Database Schema

The application uses **PostgreSQL** managed via **Prisma ORM**.

### Models

| Model                | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `User`               | Core user account (email, username, role, verification status)            |
| `Profile`            | Extended user profile (bio, social links, avatar, completeness score)     |
| `QRCode`             | Online and offline QR codes per user with scan_count tracking             |
| `PrintingOrder`      | Card print orders with design config, status lifecycle, vendor assignment |
| `Vendor`             | Print vendors who fulfil orders                                           |
| `SignupVerification` | Temporary OTP records for email registration                              |
| `OTP`                | Temporary OTP records for password reset and re-verification              |

### Order Status Lifecycle

```
PENDING → CONFIRMED → PROCESSING → DELIVERED → COMPLETED
    └──────────────────────────────→ CANCELLED
```

### Useful database commands

```bash
# View database in browser GUI
npm run db:studio

# Apply schema changes to database
npx prisma db push

# Create and run a new migration
npm run db:migrate

# Reset and reseed (development only — destroys all data)
npx prisma migrate reset
```

---

## API Documentation

### 📖 Online Documentation

The full interactive API documentation is published on Postman:

**[https://documenter.getpostman.com/view/44398656/2sBY4VLHjT](https://documenter.getpostman.com/view/44398656/2sBY4VLHjT)**

### Quick Reference

| Group | Endpoints |
|---|---|
| Auth | Register (OTP flow), Login, Google OAuth, Forgot/Reset Password, Change Password |
| Profile | Get/Update profile, Avatar upload/delete, Public profile |
| QR Codes | Generate Online QR, Generate Offline vCard QR, List, Delete |
| Orders | Place order, List, Get by ID, Cancel |
| AI | Generate bio, Profile completeness suggestions |
| Admin | Dashboard, User management, Order management, Vendor CRUD |

**Base URL:** `https://backend-onrender-qbu7.onrender.com/api`

**Authentication:** All protected endpoints require `Authorization: Bearer <JWT>` header.

**Rate limiting:** AI endpoints are limited to 10 requests per 15 minutes per IP.

### Run in Postman

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/44398656/2sBY4VLHjT)

Or import the local collection file:

1. Open Postman → **Import** → select `Backend/postman_collection.json`
2. Set collection variable `baseUrl` to your API URL
3. Run **Login** — the test script auto-saves the JWT to the `token` variable
4. All protected endpoints use `{{token}}` automatically

---

## Deployment

### Backend (Render)

1. Connect your GitHub repo to [render.com](https://render.com)
2. Create a **Web Service** pointing to the `Backend/` directory
3. **Build command:** `npm install && npx prisma generate`
4. **Start command:** `npm start`
5. Add all required environment variables in Render Dashboard → Environment
6. Add your Render service URL to the CORS allowed origins in `src/app.js`

### Frontend (Netlify)

1. Connect your GitHub repo to [netlify.com](https://netlify.com)
2. **Base directory:** `Frontend`
3. **Build command:** `npm run build`
4. **Publish directory:** `Frontend/dist`
5. Add environment variables in Netlify → Site Settings → Environment Variables:
   - `VITE_API_URL` = `https://your-render-service.onrender.com/api`
   - `VITE_RECAPTCHA_SITE_KEY` = your reCAPTCHA site key
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
6. Add a `_redirects` file in `Frontend/public/`:
   ```
   /*    /index.html    200
   ```

### Google OAuth Setup (Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   - `https://qrcard.dev`
   - `https://www.qrcard.dev`
4. No redirect URIs needed (`@react-oauth/google` uses implicit flow)

---

## Screenshots

| Page               | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| Landing Page       | Hero, Features, Pricing, FAQ                                        |
| Dashboard          | Stats (Profile Score, QR Codes, Total Scans, Orders), Quick Actions |
| Digital Profile    | 4-tab editor — Basic Info, Contact, Social, Bio with AI generator   |
| QR Code Studio     | Generate Online/Offline QR, download PNG, copy profile link         |
| Card Design Studio | Live 3.5×2" business card preview with customization controls       |
| Print Orders       | Quantity, paper type, payment method, delivery address              |
| Public Profile     | Shareable profile card with social links and Save Contact button    |
| Admin Dashboard    | Stats overview, recent orders, quick action panel                   |
| Admin Users        | Block/unblock users, create new users/admins, view modal            |
| Admin Orders       | Full order lifecycle management, vendor assignment                  |

---

## Team

| Name                     | Role                      |
| ------------------------ | ------------------------- |
| **Anisha Pakhrin**       | Documentation and Testing |
| **Pujan Poudel**         | System Design and UI/UX   |
| **Rajan Kshedal**        | Backend Developer         |
| **Sanchita Thapa Magar** | Frontend Developer        |

**Institution:** Nepal College of Information Technology (NCIT), Balkumari, Lalitpur  
**University:** Pokhara University  
**Programme:** Bachelor of Computer Applications (BCA)  
**Project Year:** 2026

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ for the BCA Final Year Project at NCIT · Pokhara University</p>
  <p>
    <a href="https://qrcard.dev">Live Demo</a> ·
    <a href="https://qrcard.dev/admin">Admin Panel</a> ·
    <a href="https://github.com/noobsixt9/QRCard/issues">Report Bug</a>
  </p>
</div>
