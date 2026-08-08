# Kazana Phase 1 — Backend Setup

## 1. Create the backend

From the Kazana repository root:

```bash
mkdir -p backend
cd backend
```

If you are starting from an empty backend, copy this Phase 1 bundle into `backend/`.

## 2. Install dependencies

```bash
npm install
```

This creates `package-lock.json`. Commit that lockfile to Git so CI/CD and future container builds are reproducible.

## 3. Create the environment file

```bash
cp .env.example .env
```

Generate a strong JWT secret and place it in `.env`.

Linux/macOS:
```bash
openssl rand -base64 48
```

PowerShell:
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

For local development, use:

```env
DATABASE_URL=postgresql://kazana:kazana_dev@localhost:5432/kazana?schema=public
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
PORT=3000
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=documents
MAX_UPLOAD_SIZE_BYTES=10485760
```

Azure Blob uploads require a real `AZURE_STORAGE_CONNECTION_STRING`. The API will still start only if the variable is present; upload operations require the value to be valid.

## 4. Validate Prisma

```bash
npm run prisma:validate
```

Expected:
```text
The schema at src/prisma/schema.prisma is valid.
```

## 5. Generate Prisma Client

```bash
npm run prisma:generate
```

## 6. Run the first migration

Start PostgreSQL first, then:

```bash
npm run prisma:migrate -- --name init
```

Expected result includes a new migration under:

```text
src/prisma/migrations/<timestamp>_init/
```

## 7. Start Redis

Redis must be reachable at the `REDIS_URL`.

Verify:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

## 8. Start the API

```bash
npm run start:dev
```

Expected:

```text
Kazana API listening on http://localhost:3000
```

## 9. Health check

```bash
curl http://localhost:3000/health
```

The response is wrapped by the global transform interceptor and should contain:

```json
{
  "data": {
    "status": "ok",
    "service": "kazana-api",
    "timestamp": "..."
  },
  "meta": {
    "timestamp": "..."
  }
}
```

## 10. Register an account

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"ChangeMe123!","name":"Demo User"}'
```

The response contains an `accessToken` and sanitized user object. `passwordHash` must never appear.

## 11. Authenticated request

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 12. Prisma Studio

```bash
npm run prisma:studio
```

Open the URL Prisma prints, normally:

```text
http://localhost:5555
```

## 13. Tests

Unit tests:

```bash
npm test
```

End-to-end tests:

```bash
npm run test:e2e
```

## 14. Production build

```bash
npm run build
```

Expected:

```text
Successfully compiled
```

## 15. Podman image

From the repository root:

```bash
podman build -t kazana-api:local ./backend
```

Run it with a configured environment file:

```bash
podman run --rm \
  --env-file ./backend/.env \
  -p 3000:3000 \
  kazana-api:local
```

The database and Redis URLs must point to services reachable from the container.

## Common errors

### Prisma cannot connect

Check PostgreSQL is running and that `DATABASE_URL` matches the database credentials.

### Redis connection errors

Check Redis is running and that `REDIS_URL` is reachable.

### JWT_SECRET validation error

The secret must be at least 32 characters.

### Azure upload failure

Set a valid Azure Storage connection string and make sure the storage account allows the application to create/use the configured container.

### TypeScript errors after Prisma changes

Run:

```bash
npm run prisma:generate
npm run build
```
