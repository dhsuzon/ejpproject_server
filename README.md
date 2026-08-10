# SCIC/EJP-13 Backend API

A 'production-ready , modular REST API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**, with **JWT** authentication and **bcrypt** password hashing.

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Runtime  | Node.js + Express 5              |
| Language | TypeScript (strict)              |
| ORM      | Prisma (Migrate, Studio, Client) |
| Database | PostgreSQL                       |
| Auth     | JWT (jsonwebtoken) + bcrypt      |
| Config   | dotenv                           |
| CORS     | cors                             |

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
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── user/
│   │   ├── category/
│   │   ├── product/
│   │   └── review/
│   └── lib/                       # Shared infra
│       ├── prisma.ts              # PrismaClient (driver adapter)
│       ├── response.ts            # Consistent { success, message, data } envelope
│       ├── error.ts               # AppError + global error & 404 handlers
│       ├── auth.ts                # createToken, verifyToken, isAdmin, bcrypt
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
# edit .env and set DATABASE_URL, SECRET, BCRYPT_PASSWORD_SLOT
```

```
PORT=5000
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/product_db
SECRET=your_jwt_secret
BCRYPT_PASSWORD_SLOT=16
```

### 3. Install, Migrate, Run

```bash
npm install
npm run prisma:migrate   # run migrations
npm run prisma:generate  # generate Prisma Client
npm run dev              # start with hot reload
```

Other scripts:

```bash
npm run typecheck        # tsc --noEmit
npm run prisma:studio    # Open Prisma Studio GUI
npm start                # run without watch
```

## Database Design

- Normalized relational schema with 4 models: `User`, `Category`, `Product`, `Review`
- Enums: `Role` (`USER` | `ADMIN`), `IsActive` (`ACTIVE` | `INACTIVE`)
- Relationships: `Product → Category` (many-to-one), `Review → User & Product` (many-to-one)
- Every model: `id` (UUIDv7), `isDeleted` (soft delete), `createdAt`, `updatedAt`
- Table names mapped with `@@map()` (e.g. `User → users`, `Product → products`)
- Indexes on foreign keys: `products.categoryId`, `reviews.userId`, `reviews.productId`

## API Convention

All endpoints return a consistent envelope:

```jsonc
// Success
{ "success": true, "message": "Product retrieved successfully", "data": { } }

// Error
{ "success": false, "message": "Product not found" }
```

- Base URL: `http://localhost:5000/api`
- Paginated list responses return: `{ items: [], meta: { page, limit, skip, total, totalPages } }`
- **Authentication**: send `Authorization: Bearer <token>` on protected routes
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

## Authentication — `/api/auth`

### POST `/api/auth/register` — Create a new user account

**Request body:**

```jsonc
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "image": "https://.../avatar.png", // optional
}
```

**Response — `201 Created`**

```jsonc
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
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

**Response — `200 OK`** (same shape as register: `token` + `user`)

**Errors:** `400`, `401` (invalid credentials or account deactivated/deleted)

### GET `/api/auth/me` — Get the currently authenticated user 🔒

**Auth:** Bearer token required

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

---

## Users — `/api/users` 🔒 (all routes require a token)

> `POST, GET /, DELETE` are **admin-only**; `GET /:id` and `PATCH /:id` are self-or-admin.

### POST `/api/users` — Create a user (admin) 👑

**Request body:** same as `/auth/register` plus optional `"role": "ADMIN"`

**Response — `201 Created`** → sanitized user

### GET `/api/users` — List users (admin) 👑

**Query params:** `page`, `limit`, `search` (name/username/email contains)

**Response — `200 OK`** → `{ items, meta }`

### GET `/api/users/:id` — Get a single user 🔒

**Response — `200 OK`** → sanitized user · **Errors:** `404`

### PATCH `/api/users/:id` — Update a user 🔒

**Request body:** any of `name`, `username`, `email`, `image`, `password`, `role`

**Response — `200 OK`** → updated sanitized user · **Errors:** `400`, `403`, `404`, `409`

### DELETE `/api/users/:id` — Soft delete a user (admin) 👑

**Response — `200 OK`** `{ "id": "..." }` · **Errors:** `403`, `404`

---

## Categories — `/api/categories`

> Reads are public; create/update/delete require a token 🔒

### POST `/api/categories` — Create a category 🔒

**Request body:** `{ "name": "Electronics" }`

**Response — `201 Created`** → category · **Errors:** `400`, `409`

### GET `/api/categories` — List categories

**Query params:** `page`, `limit`, `search`

**Response — `200 OK`** → `{ items, meta }`

### GET `/api/categories/:id` — Get a category with its products

**Response — `200 OK`** → category incl. `product` array · **Errors:** `404`

### PATCH `/api/categories/:id` — Update a category 🔒

**Request body:** `{ "name": "New Name" }`

**Response — `200 OK`** → updated category · **Errors:** `400`, `404`, `409`

### DELETE `/api/categories/:id` — Soft delete a category 🔒

**Response — `200 OK`** · **Errors:** `404`

---

## Products — `/api/products`

> Reads are public; create/update/delete require a token 🔒

### POST `/api/products` — Create a product 🔒

**Request body:**

```jsonc
{
  "name": "Laptop",
  "title": "MacBook Pro 14",
  "image": "https://.../laptop.jpg",
  "price": 1999.99,
  "stock": 10, // optional, default 0
  "description": "...", // optional
  "categoryId": "019f...", // must reference an existing category
}
```

**Response — `201 Created`** → product · **Errors:** `400`, `404` (category not found)

### GET `/api/products` — List products (with filters)

**Query params:** `page`, `limit`, `search` (name/title contains), `categoryId`, `minPrice`, `maxPrice`

**Response — `200 OK`** → `{ items, meta }` (each item includes its `category`)

### GET `/api/products/:id` — Get a single product

**Response — `200 OK`** → product incl. `category` and non-deleted `reviews` with review author · **Errors:** `404`

### PATCH `/api/products/:id` — Update a product 🔒

**Request body:** any of `name`, `title`, `image`, `description`, `price`, `stock`, `categoryId`

**Response — `200 OK`** → updated product · **Errors:** `400`, `404`

### DELETE `/api/products/:id` — Soft delete a product 🔒

**Response — `200 OK`** · **Errors:** `404`

---

## Reviews — `/api/reviews`

> Reads are public; create requires a token 🔒; update/delete are owner-or-admin.

### POST `/api/reviews` — Create a review 🔒

**Request body:**

```jsonc
{
  "rating": 5, // integer 1–5
  "comment": "Amazing!", // optional
  "productId": "019f...",
}
```

**Response — `201 Created`** → review · **Errors:** `400`, `404` (product not found)

### GET `/api/reviews` — List reviews

**Query params:** `page`, `limit`, `productId` (filter by product)

**Response — `200 OK`** → `{ items, meta }` (items include `user` and `product` summaries)

### GET `/api/reviews/:id` — Get a single review

**Response — `200 OK`** → review · **Errors:** `404`

### PATCH `/api/reviews/:id` — Update a review 🔒

**Auth:** owner or admin · **Request body:** `{ "rating"?, "comment"? }`

**Response — `200 OK`** → updated review · **Errors:** `400`, `403`, `404`

### DELETE `/api/reviews/:id` — Soft delete a review 🔒

**Auth:** owner or admin · **Response — `200 OK`** · **Errors:** `403`, `404`

---

## Prisma Feature Coverage

- ✅ **Client** via driver adapter (`@prisma/adapter-pg`) → `src/lib/prisma.ts`
- ✅ **Migrate** — versioned SQL in `prisma/migrations` (run with `npm run prisma:migrate`)
- ✅ **Studio** — `npm run prisma:studio`
- ✅ **Relations** — `Product↔Category`, `Review↔User`, `Review↔Product`
- ✅ **Enums** — `Role`, `IsActive`
- ✅ **Indexes** — on all foreign keys

## License

ISC
