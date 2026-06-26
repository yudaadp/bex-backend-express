# BEX - Backend Express PostgreSQL JWT Starter

Starter backend menggunakan Express.js, PostgreSQL, dan JWT authentication.

## Fitur

- Register dan login user
- Password hashing dengan bcrypt
- JWT access token
- Middleware route protected
- PostgreSQL connection pool
- Migrasi database sederhana
- Validasi request dengan Zod
- Security middleware dasar: Helmet dan CORS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

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
  "email": "demo@example.com",
  "password": "password123"
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
  controllers/
    auth.controller.js
  db/
    index.js
    migrate.js
    schema.sql
  middleware/
    auth.middleware.js
    error.middleware.js
  routes/
    auth.routes.js
  utils/
    jwt.js
```
