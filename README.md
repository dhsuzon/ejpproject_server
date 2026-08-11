# SCIC/EJP-13 Backend API

A production-ready, modular REST API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**, with **JWT** (stored in an **httpOnly cookie**) authentication and **bcrypt** password hashing.

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Runtime  | Node.js + Express 5                           |
| Language | TypeScript (strict)                           |
| ORM      | Prisma (Migrate, Studio, Client)              |
| Database | PostgreSQL                                    |
| Auth     | JWT (jsonwebtoken) + bcrypt + httpOnly cookie |
| Cookies  | cookie-parser                                 |
| Config   | dotenv                                        |
| CORS     | cors (credentials-enabled)                    |

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.ts                     # Express app: middleware, routes, error handlers
│   ├── server.ts                  # Entry: DB connect + listen
│   ├── routes/                    # Route definitions (one per module)
│   ├── services/
│   │   ├── auth/                  # auth.controller.ts, auth.service.ts
│   │   ├── user/
│   │   ├── category/
│   │   ├── product/
│   │   ├── review/
│   │   ├── order/
│   │   └── payment/ dashboard/ newsletter/
│   └── lib/                       # Shared infra
│       ├── prisma.ts              # PrismaClient (driver adapter)
│       ├── response.ts            # Consistent { success, message, data } envelope
│       ├── error.ts               # AppError + global error & 404 handlers
│       ├── auth.ts                # createToken, setAuthCookie, clearAuthCookie, verifyToken, isAdmin, bcrypt
│       ├── validation.ts          # Manual request validation helpers
│       ├── pagination.ts          # getPagination / buildPagedData
│       ├── http.ts                # typed route param helper
│       ├── transform.ts           # user sanitization (no password leak)
│       └── types/
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

### 1. Requirements

- Node.js >= 20
- PostgreSQL running locally (or Supabase / NeonDB)

### 2. Environment Setup

```bash
cp .env.example .env

```

```
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/product_db
SECRET=your_jwt_secret_key_change_this
BCRYPT_PASSWORD_SLOT=16
CLIENT_URL=http://localhost:3000
COOKIE_SECURE=false
AUTH_COOKIE_TOKEN=your choises store token
```

> `CLIENT_URL` is the allowed frontend origin. For local development requests from `http://localhost:<any-port>` and `http://127.0.0.1:<any-port>` are also accepted.

### 3. Install, Migrate, Run

```bash
npm install
npm run prisma:migrate   # run migrations
npm run prisma:generate  # generate Prisma Client
npm run db:seed          # optional: seed demo user + categories + products
npm run dev              # start with hot reload
```

Other scripts:

```bash
npm run typecheck     # tsc --noEmit
npm run prisma:studio # Open Prisma Studio GUI
npm start             # run without watch
```

The API runs at `http://localhost:4000`.

## Database Design

- Normalized relational schema with 5 models: `User`, `Category`, `Product`, `Review`, `Order`
- Enums: `Role` (`USER` | `ADMIN`), `IsActive` (`ACTIVE` | `INACTIVE`), `OrderStatus` (`PENDING` | `SHIPPING` | `DELIVERED`)
- Relationships:
  - `Product → Category` (many-to-one)
  - `Review → User & Product` (many-to-one)
  - `Order → User` (many-to-one); order line items stored as `Json`
- Every model: `id` (UUIDv7), `isDeleted` (soft delete), `createdAt`, `updatedAt`
- Table names mapped with `@@map()` (e.g. `User → users`, `Product → products`)
- Indexes on foreign keys: `products.categoryId`, `reviews.userId`, `reviews.productId`, `orders.userId`

## API Convention

All endpoints return a consistent envelope:

```jsonc
// Success
{ "success": true, "message": "Product retrieved successfully", "data": { } }

// Error
{ "success": false, "message": "Product not found" }
```

- Base URL: `http://localhost:4000/api`
- Paginated list responses return: `{ items: [], meta: { page, limit, skip, total, totalPages } }`
- **Authentication**: on login/register the server sets a `shopnexus_token` **httpOnly cookie** (`SameSite=Lax`, 7 days). The frontend must send requests with `credentials: "include"`. A `Authorization: Bearer <token>` header is also accepted for API clients.
- **Soft Delete**: `DELETE` sets `isDeleted = true`; deleted records are excluded from all reads

### HTTP Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK                                      |
| 201  | Created                                 |
| 400  | Bad request / validation failed         |
| 401  | Unauthenticated (missing/invalid login) |
| 403  | Forbidden (invalid/expired token, role) |
| 404  | Not found                               |
| 409  | Conflict (duplicate unique field)       |
| 500  | Internal server error                   |

---

## API Endpoint Reference

> **Auth legend:** Public = no auth required · 🔒 = logged-in user (valid token / `shopnexus_token` httpOnly cookie or `Authorization: Bearer <token>`) · 👑 = **admin only** · ✍️ = owner **or** admin

| Method | Endpoint                             | Description                                    | Auth    |
| ------ | ------------------------------------ | ---------------------------------------------- | ------- |
| POST   | `/api/auth/register`                 | Create a user account (auto-login)             | Public  |
| POST   | `/api/auth/login`                    | Sign in with email & password                  | Public  |
| POST   | `/api/auth/logout`                   | Sign out and clear the session cookie          | Public  |
| GET    | `/api/auth/me`                       | Get the current authenticated user             | 🔒      |
| POST   | `/api/users`                         | Create a user                                  | 👑      |
| GET    | `/api/users`                         | List users (paginated)                         | 👑      |
| GET    | `/api/users/:id`                     | Get a single user                              | 🔒 self |
| PATCH  | `/api/users/:id`                     | Update a user (self or admin)                  | ✍️      |
| DELETE | `/api/users/:id`                     | Soft delete a user                             | 👑      |
| GET    | `/api/categories`                    | List categories (paginated)                    | Public  |
| GET    | `/api/categories/:id`                | Get a category with its products               | Public  |
| POST   | `/api/categories`                    | Create a category                              | 🔒      |
| PATCH  | `/api/categories/:id`                | Update a category                              | 🔒      |
| DELETE | `/api/categories/:id`                | Soft delete a category                         | 🔒      |
| GET    | `/api/products`                      | List products (search/filter/sort/paginate)    | Public  |
| GET    | `/api/products/categories`           | List product categories                        | Public  |
| GET    | `/api/products/:id`                  | Get a single product                           | Public  |
| GET    | `/api/products/:id/reviews`          | Get reviews for a product                      | Public  |
| GET    | `/api/products/:id/related`          | Get related products                           | Public  |
| POST   | `/api/products`                      | **Create a product**                           | 👑      |
| PATCH  | `/api/products/:id`                  | **Update a product**                           | 👑      |
| DELETE | `/api/products/:id`                  | **Soft delete a product**                      | 👑      |
| POST   | `/api/products/:id/reviews`          | **Add a review to a product (login required)** | 🔒      |
| GET    | `/api/reviews`                       | List reviews (paginated)                       | Public  |
| GET    | `/api/reviews/:id`                   | Get a single review                            | Public  |
| POST   | `/api/reviews`                       | **Create a review (login required)**           | 🔒      |
| PATCH  | `/api/reviews/:id`                   | Update a review (author or admin)              | ✍️      |
| DELETE | `/api/reviews/:id`                   | Soft delete a review (author or admin)         | ✍️      |
| POST   | `/api/orders`                        | Create an order for the current user           | 🔒      |
| GET    | `/api/orders/my-orders`              | Get the current user's orders                  | 🔒      |
| GET    | `/api/orders/all`                    | Get all orders                                 | 👑      |
| PATCH  | `/api/orders/:id/status`             | Update an order status                         | 👑      |
| POST   | `/api/payment/confirm-order`         | Confirm order after checkout                   | 🔒      |
| POST   | `/api/payment/create-payment-intent` | Create Stripe intent (stub — returns 400)      | 🔒      |
| GET    | `/api/dashboard/stats`               | Dashboard stats                                | 👑      |
| GET    | `/api/dashboard/monthly-orders`      | Orders grouped by month/year                   | 👑      |
| GET    | `/api/dashboard/order-status`        | Orders grouped by status                       | 👑      |
| POST   | `/api/newsletter/subscribe`          | Subscribe an email                             | Public  |

---

## Roles & Permissions

- **Product CRUD is admin-only.** Only users with role `ADMIN` can **create, update, or delete** products (`POST` / `PATCH` / `DELETE /api/products/:id`). Any other role gets `403 Forbidden`. Everyone else (logged-in or not) can still **browse** products and read product data.
- **Only logged-in users can review products.** Submitting a review (`POST /api/products/:id/reviews` or `POST /api/reviews`) requires a valid login (🔒). Visitors without a token get `401`. A review can only be **edited or deleted by its author, or by an admin** (✍️).
- **Admin-only (👑):** user management (`/api/users`), viewing all orders + updating order status (`/api/orders/all`, `/api/orders/:id/status`), and dashboard analytics (`/api/dashboard`).
- **Logged-in users (🔒):** create orders, view their own order history, update their own profile.

---

## Authentication — `/api/auth`

### POST `/api/auth/register` — Create a new user account (auto-login)

**Request body:**

```jsonc
{
  "name": "John Doe",
  "username": "johndoe", // optional
  "email": "john@example.com",
  "password": "secret123",
  "image": "https://.../avatar.png", // optional
}
```

**Response — `201 Created`** (sets `shopnexus_token` httpOnly cookie)

```jsonc
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "019f...",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "image": null,
      "role": "USER",
      "isActive": "ACTIVE",
    },
  },
}
```

**Errors:** `400` (validation), `409` (email/username taken)

### POST `/api/auth/login` — Sign in with email & password

**Request body:**

```jsonc
{ "email": "john@example.com", "password": "secret123" }
```

**Response — `200 OK`** (same shape as register, sets `shopnexus_token` httpOnly cookie)

**Errors:** `400`, `401` (invalid credentials or account deactivated/deleted)

### POST `/api/auth/logout` — Sign out

Clears the `shopnexus_token` cookie. **Response — `200 OK`**

### GET `/api/auth/me` — Get the currently authenticated user 🔒

**Auth:** httpOnly cookie (or Bearer token)

**Response — `200 OK`**

```jsonc
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": "019f...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "image": null,
    "role": "USER",
    "isActive": "ACTIVE",
  },
}
```

**Errors:** `401` (no cookie/token), `403` (invalid/expired)

---

## Users — `/api/users` 🔒

> `POST, GET /, DELETE` are **admin-only**; `GET /:id` and `PATCH /:id` are self-or-admin.

### POST `/api/users` — Create a user (admin) 👑

**Request body:** same as `/auth/register` plus optional `"role": "ADMIN"` · **Response — `201 Created`**

### GET `/api/users` — List users (admin) 👑

**Query params:** `page`, `limit`, `search` · **Response — `200 OK`** → `{ items, meta }`

### GET `/api/users/:id` — Get a single user 🔒 · **Errors:** `404`

### PATCH `/api/users/:id` — Update a user 🔒

**Request body:** any of `name`, `username`, `email`, `image`, `password`, `role` · **Errors:** `400`, `403`, `404`, `409`

### DELETE `/api/users/:id` — Soft delete a user (admin) 👑

---

## Categories — `/api/categories`

> Reads are public; create/update/delete require a token 🔒

### POST `/api/categories` — Create a category 🔒 · **Errors:** `400`, `409`

### GET `/api/categories` — List categories (`page`, `limit`, `search`) → `{ items, meta }`

### GET `/api/categories/:id` — Category with its `product[]` · **Errors:** `404`

### PATCH `/api/categories/:id` — Update a category 🔒 · **Errors:** `400`, `404`, `409`

### DELETE `/api/categories/:id` — Soft delete a category 🔒 · **Errors:** `404`

---

## Products — `/api/products`

> Reads are **public**; create/update/delete are **admin-only** 👑; adding a review requires a login 🔒

### POST `/api/products` — Create a product 👑

```jsonc
{
  "name": "Laptop",
  "title": "MacBook Pro 14",
  "image": "https://.../laptop.jpg",
  "price": 1999.99,
  "stock": 10, // optional, default 0
  "description": "...", // optional
  "categoryId": "019f...",
}
```

**Errors:** `400`, `404` (category not found)

### GET `/api/products` — List products with filters

**Query params:** `page`, `limit`, `search`, `categoryId`, `minPrice`, `maxPrice` → `{ items, meta }`

### GET `/api/products/:id` — Single product incl. `category` and non-deleted `reviews`

### GET `/api/products/:id/reviews` — Reviews for a product

### GET `/api/products/:id/related` — Related products

### POST `/api/products/:id/reviews` — Add a review to a product 🔒 (logged-in users only)

### PATCH `/api/products/:id` — Update a product 👑

**Request body:** any of `name`, `title`, `image`, `description`, `price`, `stock`, `categoryId` · **Errors:** `400`, `404`

### DELETE `/api/products/:id` — Soft delete a product 👑

---

## Reviews — `/api/reviews`

> Reads are public; **creating a review requires a logged-in user** 🔒; update/delete are owner-or-admin (✍️).

### POST `/api/reviews` — Create a review 🔒 (logged-in users only)

```jsonc
{ "rating": 5, "comment": "Amazing!", "productId": "019f..." }
```

**Errors:** `400`, `404`

### GET `/api/reviews` — List (`page`, `limit`, `productId`) → `{ items, meta }`

### GET `/api/reviews/:id` — Single review · **Errors:** `404`

### PATCH `/api/reviews/:id` — Update (owner or admin) 🔒 · **Errors:** `400`, `403`, `404`

### DELETE `/api/reviews/:id` — Soft delete (owner or admin) 🔒 · **Errors:** `403`, `404`

---

## Orders — `/api/orders` 🔒 (all routes require a token)

### POST `/api/orders` — Create an order for the current user

Creates an order with status `PENDING` from the provided line items and decrements product stock.

```jsonc
{
  "totalAmount": 1999.99,
  "items": [
    {
      "productId": "019f...",
      "name": "Laptop",
      "price": 1999.99,
      "quantity": 1,
      "image": "https://...",
    },
  ],
  "paymentIntentId": "pi_...", // optional
}
```

### GET `/api/orders/my-orders` — Current user's orders (latest first)

### GET `/api/orders/all` — All orders (admin) 👑

### PATCH `/api/orders/:id/status` — Update an order status (admin) 👑

**Request body:** `{ "status": "shipping" }` (accepts `pending` | `shipping` | `delivered`, case-insensitive). The stored value is the uppercase enum (`SHIPPING`).

---

## Payments — `/api/payment` 🔒 (all routes require a token)

### POST `/api/payment/confirm-order` — Create order after checkout (same as `POST /orders`)

### POST `/api/payment/create-payment-intent` — Currently returns `400` "Stripe is not configured. Use demo checkout instead."

---

## Dashboard — `/api/dashboard` 🔒 (admin)

### GET `/api/dashboard/stats` — Total products, orders, revenue, pending orders

### GET `/api/dashboard/monthly-orders` — Order counts grouped by month/year

### GET `/api/dashboard/order-status` — Order counts grouped by status

---

## Newsletter — `/api/newsletter`

### POST `/api/newsletter/subscribe` — Subscribe an email

**Request body:** `{ "email": "john@example.com" }` · **Errors:** `400`, `409`

---

## Prisma Feature Coverage

- ✅ **Client** via driver adapter (`@prisma/adapter-pg`) → `src/lib/prisma.ts`
- ✅ **Migrate** — versioned SQL in `prisma/migrations` (`npm run prisma:migrate`)
- ✅ **Studio** — `npm run prisma:studio`
- ✅ **Relations** — `Product↔Category`, `Review↔User`, `Review↔Product`, `Order↔User`
- ✅ **Enums** — `Role`, `IsActive`, `OrderStatus`
- ✅ **Indexes** — on all foreign keys

## License

ISC
