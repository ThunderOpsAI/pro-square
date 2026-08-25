# Pro Square Tiling — Full-Stack Next.js & AI Web Application

A modern, production-grade full-stack web application for **Pro Square Tiling** built with **Next.js 16 (App Router)**, **PostgreSQL (Prisma 7)**, **Google Gemini AI triage (`@google/genai`)**, **Resend transactional emails**, **Cloudflare Turnstile bot protection**, and a **secure `/admin` lead management portal**.

---

## 🌟 Key Architecture & Features

1. **Frontend Landing Page:**
   - Next.js 16 App Router with server/client component boundaries
   - Tailwind CSS v4 styling with dynamic multi-theme engine (Slate & Blue, Terracotta, Emerald, Copper) and `localStorage` persistence
   - Motion animated interactions with optimized `next/image` hero and gallery showcases
   - Controlled quote consultation form with Zod client validation and Cloudflare Turnstile integration

2. **Call Tracking Telemetry:**
   - Standard native `tel:` click-to-dial for immediate direct calling
   - Asynchronous telemetry logging to `POST /api/leads/call-click` (capturing intent, referrer, and anonymized SHA-256 IP hash)

3. **Quote Processing & AI Triage Pipeline:**
   - **Primary Action (Reliability-First):** Submissions validated via Zod + sliding window rate limiting (5 req/hr/IP) and saved directly to PostgreSQL.
   - **Secondary Action (Graceful Best-Effort):** Automatically triggers **Gemini 2.5 Flash** (`@google/genai`) to generate structured job summaries, scope classification, AUD ballpark estimates ($50-$120/m²), and customer draft proposals.
   - **Dual Transactional Email Delivery (Resend):** Instant HTML alert dispatched to the business owner + branded acknowledgment email to the customer.

4. **Secure Admin Dashboard (`/admin`):**
   - Iron-session cookie authentication with `bcryptjs` password hashing and route middleware guards
   - Executive metrics: Total quotes, active pipeline value ($ AUD), phone inquiries, conversion rate
   - Filterable & searchable lead pipeline (`NEW`, `CONTACTED`, `QUOTED`, `WON`, `LOST`)
   - Interactive Lead Inspection Drawer displaying customer details, form inputs, and Gemini AI triage breakdown + 1-click email response copy
   - Call log telemetry viewer

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25 / v20 / v18)
- **PostgreSQL Database**: Local PostgreSQL, Supabase, Neon, or Railway

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and configure your API keys:
```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) |
| `RESEND_API_KEY` | Resend API key from [Resend](https://resend.com/) |
| `BUSINESS_OWNER_EMAIL` | Owner notification inbox (e.g. `owner@prosquaretiling.com`) |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Turnstile secret key |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Turnstile public site key |
| `ADMIN_EMAIL` | Admin login email (default: `admin@prosquaretiling.com`) |
| `ADMIN_PASSWORD` | Admin login password (default: `AdminSecure2026!`) |
| `ADMIN_SESSION_SECRET` | 32+ char random string for session cookie encryption |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Business phone displayed on site (default: `(555) 123-4567`) |

### 4. Database Setup & Seeding
```bash
# Push schema to database
npx prisma db push

# Seed initial admin user
npm run prisma:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public landing page and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### 6. Production Build Verification
```bash
npm run build
npm start
```
