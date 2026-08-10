# Kazana — Your job search, beautifully organized.

Kazana is a premium, Apple-inspired productivity application designed to organize and streamline your job search. Track applications through an interactive Kanban pipeline, schedule mock interviews, manage resumes, create draft templates, and view conversion metrics on a clean dashboard.

---

## Architecture

```mermaid
graph TD
    User[Client Browser] -->|React TS / Tailwind v4| Frontend[Vite Web App]
    Frontend -->|HTTP / JWT| Backend[NestJS Web API]
    Backend -->|ORM| Prisma[Prisma Client]
    Prisma -->|Query| DB[(PostgreSQL Database)]
    Backend -->|Jobs / Events| BullMQ[BullMQ / ioredis]
    BullMQ -->|Queue Store| Cache[(Redis Cache)]
```

---

## Prerequisites

Ensure you have the following installed on your developer machine:
- **Node.js** (v22.x or later)
- **Docker** or **Podman**
- **NPM** (v10.x or later)

---

## Environment Variables

### Backend (`backend/.env`)
Create `backend/.env` copying from `backend/.env.example`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/kazana?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super-secret-key-change-me-in-production
JWT_EXPIRES_IN=7d
AZURE_STORAGE_CONNECTION_STRING="your-azure-connection-string"
AZURE_STORAGE_CONTAINER="your-container-name"
```

### Frontend (`frontend/.env`)
Create `frontend/.env` copying from `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:3000
```

---

## Database Setup & Migrations

Launch PostgreSQL in a Docker container:
```bash
docker run -d --name postgres16 -p 5435:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kazana postgres:16-alpine
```

Deploy the database migrations and generate the client ORM:
```bash
cd backend
npx prisma migrate dev
npx prisma generate --schema=src/prisma/schema.prisma
```

---

## Redis Setup

Launch a Redis 7 server container:
```bash
docker run -d --name redis7 -p 6379:6379 redis:7-alpine
```

---

## Starting the Application

### Backend API
```bash
cd backend
npm install
npm run start:dev
```
API launches at `http://localhost:3000`. Query `/health` to verify service availability.

### Frontend App
```bash
cd frontend
npm install
npm run dev
```
Static client launches at `http://localhost:5173`.

---

## Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
npm test
```

### Backend End-to-End Tests
```bash
cd backend
npm run test:e2e
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Docker Container Deployments

Build backend and frontend images:
```bash
docker build -t kazana-backend:latest ./backend
docker build -t kazana-frontend:latest ./frontend
```

Run containers in production environment:
```bash
# Run backend
docker run -d --name kazana-api -p 3000:3000 --env-file ./backend/.env kazana-backend:latest

# Run frontend
docker run -d --name kazana-web -p 80:80 kazana-frontend:latest
```
