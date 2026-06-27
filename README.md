# BEX - Backend Express PostgreSQL JWT Starter

Starter backend menggunakan Express.js, PostgreSQL, dan JWT authentication.

## Fitur

- Register dan login user
- Password hashing dengan bcrypt
- JWT access token dan refresh token
- Middleware route protected
- PostgreSQL connection pool
- Migrasi database sederhana
- Validasi request dengan Zod
- Rate limiter untuk endpoint auth
- Security middleware dasar: Helmet dan CORS
- Dokumentasi API otomatis dengan Swagger

## Setup

1. Install dependencies:

```bash
npm install
```

2. Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Rate limiter auth bisa diatur lewat `.env`:

```env
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

Default-nya 5 percobaan per 15 menit per IP dan endpoint untuk `/api/auth/register` dan `/api/auth/login`.

3. Jalankan PostgreSQL:

```bash
docker compose up -d
```

Atau gunakan PostgreSQL lokal dan buat database:

```bash
createdb express_starter
```

4. Jalankan migrasi:

```bash
npm run db:migrate
```

5. Jalankan aplikasi:

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`.

## Sample User :
email : admin@bex.com
password: admin123

## Dokumentasi API

Swagger UI tersedia di:

```text
http://localhost:3000/api-docs
```

OpenAPI JSON tersedia di:

```text
http://localhost:3000/api-docs.json
```

## Endpoint

### Health Check

```http
GET /health
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "demouser",
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bex.com",
  "password": "admin123"
}
```

Response login akan berisi `token` dan `refreshToken`.

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

### Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## Struktur

```text
src/
  app.js
  server.js
  config/
    env.js
    swagger.js
  controllers/
    auth.controller.js
    users.controller.js
  db/
    index.js
    migrate.js
    schema.sql
  middleware/
    auth.middleware.js
    error.middleware.js
    rate-limit.middleware.js
  services/
    auth.service.js
    users.service.js
  routes/
    auth.routes.js
    users.routes.js
  utils/
    jwt.js
```
