# Kazana Backend

> _"Your job search, beautifully organized."_

This repository contains the **NestJS 11** backend engine.

---

## 🛠️ Technology Stack

- **Core Framework**: NestJS 11 + TypeScript (Strict Type Checking)
- **Database Layer**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: Passport JWT + Bcrypt
- **Cache & Queues**: Redis 7 + BullMQ
- **Cloud Uploads**: Azure Blob Storage
- **Containerization**: Docker (Multi-stage build)

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Review and adjust the configurations in `.env`:

- `PORT`: Port the server runs on (Default: `3000`).
- `DATABASE_URL`: Connection string for PostgreSQL (e.g. `postgresql://postgres:postgres@127.0.0.1:5435/kazana?schema=public`).
- `JWT_SECRET`: Secret key used for signing JWTs.
- `JWT_EXPIRES_IN`: Access token expiration duration (e.g. `7d` for 7 days).

### 2. Run PostgreSQL via Docker

Run a PostgreSQL container using port `5435` matching the default `.env` settings:

```bash
docker run -d --name postgres16 -p 5435:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kazana postgres:16-alpine
```

### 3. Apply Database Migrations

Deploy database tables and generate the typesafe Prisma Client:

```bash
npx prisma migrate dev --name init
```

### 4. Install Dependencies & Build

```bash
npm install
npm run build
```

### 5. Running the App

```bash
# Development (watch mode)
npm run start:dev

# Production mode
npm run start:prod
```

### 6. Run Tests

```bash
npm run test
```

---

## 🧭 API Endpoints

All successful API responses are wrapped in a standard JSON envelope format:

```json
{
  "success": true,
  "data": ...
}
```

If an error is thrown, the global exception filter catches it and formats it uniformly:

```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-08-09T15:10:16.283Z",
  "path": "/auth/me",
  "message": "Invalid token or user not found"
}
```

---

### 🏥 Health Checks

#### `GET /health`

Verify that the application is running and healthy.

- **Authorization**: None (Public)
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-08-09T14:11:16.283Z"
  }
}
```

---

### 🔐 Authentication

#### `POST /auth/register`

Register a new user account.

- **Authorization**: None (Public)
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Jane Doe"
}
```

- **Response Body** (Never returns `passwordHash`):

```json
{
  "success": true,
  "data": {
    "id": "7ac15b81-d147-4952-b88a-36b3df5e975a",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatarUrl": null,
    "timezone": null,
    "createdAt": "2026-08-09T15:02:10.000Z",
    "updatedAt": "2026-08-09T15:02:10.000Z"
  }
}
```

#### `POST /auth/login`

Authenticate with email and password to receive a JWT access token.

- **Authorization**: None (Public)
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Response Body** (Contains token and user details, expires in 7 days):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "7ac15b81-d147-4952-b88a-36b3df5e975a",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatarUrl": null,
      "timezone": null,
      "createdAt": "2026-08-09T15:02:10.000Z",
      "updatedAt": "2026-08-09T15:02:10.000Z"
    }
  }
}
```

#### `GET /auth/me`

Retrieve details of the currently logged-in user profile.

- **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "7ac15b81-d147-4952-b88a-36b3df5e975a",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatarUrl": null,
    "timezone": null,
    "createdAt": "2026-08-09T15:02:10.000Z",
    "updatedAt": "2026-08-09T15:02:10.000Z"
  }
}
```

---

### 👤 User Profile

#### `GET /users/profile`

Retrieve profile of the currently logged-in user.

- **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "7ac15b81-d147-4952-b88a-36b3df5e975a",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatarUrl": null,
    "timezone": null,
    "createdAt": "2026-08-09T15:02:10.000Z",
    "updatedAt": "2026-08-09T15:02:10.000Z"
  }
}
```

#### `PATCH /users/profile`

Update one or more profile properties (name, timezone, avatarUrl) for the logged-in user.

- **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
- **Request Body**:

```json
{
  "name": "New Name",
  "timezone": "America/New_York",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "7ac15b81-d147-4952-b88a-36b3df5e975a",
    "email": "user@example.com",
    "name": "New Name",
    "avatarUrl": "https://example.com/avatar.jpg",
    "timezone": "America/New_York",
    "createdAt": "2026-08-09T15:02:10.000Z",
    "updatedAt": "2026-08-09T15:05:12.000Z"
  }
}
```

#### `POST /users/profile/password`

Change the password for the logged-in user.

- **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
- **Request Body**:

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

- **Response Body**:

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## 🔍 Database Inspection

To run Prisma's visual database manager GUI:

```bash
npx prisma studio
```

This serves a GUI client at **`http://localhost:5555`** where you can view and edit records.
