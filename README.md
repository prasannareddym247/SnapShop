# SnapShop (FreshKart)

Multi-tenant eCommerce SaaS platform & storefront engine (catalog, cart, checkout, vendor dashboards, admin platform, and customizable industry storefronts).

Lightweight full‑stack grocery storefront prototype (catalog, cart, checkout, admin, invoices).

Tech stack
----------
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: Microsoft SQL Server (primary) with a JSON file fallback (`backend/data/database_state.json`)
- Auth: JWT (stateless)

Quick start (dev)
-----------------
Prerequisites: Node.js, npm. SQL Server optional (project will fall back to JSON DB).

1. Install dependencies:

```bash
# Install both backend and frontend dependencies
npm run install:all
```

*(Or install individually: `npm install --prefix backend` and `npm install --prefix frontend`)*

2. Environment variables:
- Zero-config by default: If no `.env` is provided, the app automatically runs in local development mode using a safe default key and the JSON database fallback.
- Optional: Copy `backend/.env.example` to `backend/.env` to customize ports, SQL Server, or JWT keys.

3. Run the application:

```bash
# Run backend and frontend concurrently
npm run dev
```

* Backend API: `http://localhost:5000`
* Frontend UI: `http://localhost:5173`

Or run separately in two terminals:
```bash
npm run dev:backend
npm run dev:frontend
```

API
---
Server exposes REST endpoints under `/api`:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`
- `POST /api/orders/checkout`, `GET /api/orders/my-orders`, `GET /api/orders/invoice/:orderId`
- `GET/PUT /api/admin/orders`, `POST/PUT/DELETE /api/admin/products` (Admin only)

Auth: Bearer JWT in `Authorization` header. (The code also accepts `authorization` query param for invoice downloads — not recommended for production.)

Seed & default admin
--------------------
- Seed catalog: `backend/freshkart_catalog_seed.json` is used during DB init.
- Default admin (seeded): `admin@freshkart.com` / password `admin123` (bcrypt hash present in seeds). Rotate in production.

Notes & next steps
-------------------
- Move to modular React components and routing for maintainability.
- Replace JSON fallback with SQLite or a lightweight embedded DB for non‑blocking IO.
- Secure JWT secret and prefer HTTP‑only cookies for production.

For architecture and security notes see `ARCHITECTURE.md` and `SECURITY_REVIEW.md`.
>>>>>>> 3693732 (Initial commit: FreshKart frontend and backend)
