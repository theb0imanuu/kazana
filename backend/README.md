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

### 🏢 Companies

#### `POST /companies`
Create a new company.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "50-100",
  "location": "San Francisco, CA",
  "notes": "Fast growing startup"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
    "name": "Acme Corp",
    "website": "https://acme.com",
    "industry": "Technology",
    "size": "50-100",
    "location": "San Francisco, CA",
    "notes": "Fast growing startup",
    "logoUrl": null,
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `GET /companies`
List all companies belonging to the authenticated user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
      "name": "Acme Corp",
      "website": "https://acme.com",
      "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
    }
  ]
}
```

#### `GET /companies/:id`
Retrieve a single company by ID.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
    "name": "Acme Corp",
    "website": "https://acme.com",
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `PATCH /companies/:id`
Update a company's details.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "notes": "Updated notes"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
    "name": "Acme Corp",
    "notes": "Updated notes",
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `DELETE /companies/:id`
Delete a company.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 💼 Jobs

#### `POST /jobs`
Create a new job tracking entry. Creates an initial status change activity record automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "title": "Software Engineer",
  "remoteType": "REMOTE",
  "status": "WISHLIST",
  "priority": "MEDIUM",
  "companyId": "7bc25b81-d147-4952-b88a-36b3df5e975a",
  "salaryMin": 100000,
  "salaryMax": 140000,
  "salaryCurrency": "USD",
  "location": "Remote, US"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "title": "Software Engineer",
    "remoteType": "REMOTE",
    "status": "WISHLIST",
    "priority": "MEDIUM",
    "companyId": "7bc25b81-d147-4952-b88a-36b3df5e975a",
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `GET /jobs`
Query list of jobs with support for search, filtering, and pagination.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Query Parameters**:
  - `page`: Page number (e.g. `1`)
  - `limit`: Items per page (e.g. `10`)
  - `search`: Match on title, description, location, or company name (e.g. `Software`)
  - `status`: Filter by status (`WISHLIST`, `APPLIED`, etc.)
  - `priority`: Filter by priority (`LOW`, `MEDIUM`, etc.)
  - `remoteType`: Filter by remote type (`ONSITE`, `HYBRID`, `REMOTE`)
  - `companyId`: Filter by company UUID
  - `minSalary` & `maxSalary`: Filter by salary ranges
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
        "title": "Software Engineer",
        "remoteType": "REMOTE",
        "status": "WISHLIST",
        "priority": "MEDIUM",
        "company": {
          "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
          "name": "Acme Corp"
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### `GET /jobs/:id`
Retrieve a single job tracking entry by ID.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "title": "Software Engineer",
    "remoteType": "REMOTE",
    "status": "WISHLIST",
    "company": {
      "name": "Acme Corp"
    }
  }
}
```

#### `PATCH /jobs/:id`
Update general details of a job tracking entry. Modifying `status` triggers an activity record.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "title": "Senior Software Engineer"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "title": "Senior Software Engineer"
  }
}
```

#### `PATCH /jobs/:id/status`
Shortcut to update a job status. Triggers a transaction-wrapped status change activity record automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "status": "APPLIED"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "status": "APPLIED"
  }
}
```

#### `PATCH /jobs/:id/priority`
Shortcut to update a job priority.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "priority": "HIGH"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "priority": "HIGH"
  }
}
```

#### `DELETE /jobs/:id`
Delete a job tracking entry.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 👥 Contacts

#### `POST /contacts`
Create a new company contact.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "name": "John Doe",
  "role": "Technical Recruiter",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0199",
  "linkedin": "https://linkedin.com/in/johndoe",
  "notes": "Met at developer meetup",
  "companyId": "7bc25b81-d147-4952-b88a-36b3df5e975a"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "9ec45b81-d147-4952-b88a-36b3df5e975a",
    "name": "John Doe",
    "role": "Technical Recruiter",
    "email": "john.doe@acme.com",
    "phone": "+1-555-0199",
    "linkedin": "https://linkedin.com/in/johndoe",
    "notes": "Met at developer meetup",
    "companyId": "7bc25b81-d147-4952-b88a-36b3df5e975a",
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `GET /contacts`
List all contacts belonging to the authenticated user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "9ec45b81-d147-4952-b88a-36b3df5e975a",
      "name": "John Doe",
      "email": "john.doe@acme.com",
      "company": {
        "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
        "name": "Acme Corp"
      }
    }
  ]
}
```

#### `GET /contacts/:id`
Retrieve a single contact by ID.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "9ec45b81-d147-4952-b88a-36b3df5e975a",
    "name": "John Doe",
    "email": "john.doe@acme.com",
    "company": {
      "id": "7bc25b81-d147-4952-b88a-36b3df5e975a",
      "name": "Acme Corp"
    }
  }
}
```

#### `PATCH /contacts/:id`
Update contact details.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "role": "Lead Recruiter"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "9ec45b81-d147-4952-b88a-36b3df5e975a",
    "name": "John Doe",
    "role": "Lead Recruiter"
  }
}
```

#### `DELETE /contacts/:id`
Delete a contact.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 📅 Interviews

#### `POST /interviews`
Schedule a new interview. Triggers an `INTERVIEW_SCHEDULED` activity log automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "type": "VIDEO",
  "scheduledAt": "2026-08-15T14:00:00.000Z",
  "duration": 45,
  "location": "Google Meet",
  "notes": "Systems design round",
  "status": "SCHEDULED",
  "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a",
  "contactId": "9ec45b81-d147-4952-b88a-36b3df5e975a"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae565b81-d147-4952-b88a-36b3df5e975a",
    "type": "VIDEO",
    "scheduledAt": "2026-08-15T14:00:00.000Z",
    "duration": 45,
    "location": "Google Meet",
    "status": "SCHEDULED",
    "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "contactId": "9ec45b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `GET /interviews`
List all interviews scheduled under user's tracked jobs.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ae565b81-d147-4952-b88a-36b3df5e975a",
      "type": "VIDEO",
      "scheduledAt": "2026-08-15T14:00:00.000Z",
      "job": {
        "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
        "title": "Software Engineer"
      }
    }
  ]
}
```

#### `GET /interviews/:id`
Retrieve details of a single scheduled interview.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae565b81-d147-4952-b88a-36b3df5e975a",
    "type": "VIDEO",
    "scheduledAt": "2026-08-15T14:00:00.000Z",
    "job": {
      "id": "8dc35b81-d147-4952-b88a-36b3df5e975a",
      "title": "Software Engineer"
    }
  }
}
```

#### `PATCH /interviews/:id`
Update scheduled interview details.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae565b81-d147-4952-b88a-36b3df5e975a",
    "status": "COMPLETED"
  }
}
```

#### `DELETE /interviews/:id`
Delete an interview event.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 📄 Documents

#### `POST /documents/upload`
Upload a document. Integrates with Azure Blob Storage. Triggers a transaction-bound `DOCUMENT_ADDED` activity log automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Format**: `multipart/form-data`
* **Request Body**:
  - `file`: Binary file upload (PDF, Word docs, PNG, JPEG, Plain Text; max 5MB)
  - `type`: Document type (`RESUME`, `COVER_LETTER`, `PORTFOLIO`, `OTHER`)
  - `jobId`: Optional UUID of associated Job
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae575b81-d147-4952-b88a-36b3df5e975a",
    "name": "resume.pdf",
    "url": "https://storage.blob.core.windows.net/container/user-uuid/doc-uuid.pdf",
    "size": 102450,
    "mimeType": "application/pdf",
    "type": "RESUME",
    "isDefault": false
  }
}
```

#### `GET /documents`
List all documents belonging to the authenticated user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ae575b81-d147-4952-b88a-36b3df5e975a",
      "name": "resume.pdf",
      "url": "https://storage.blob.core.windows.net/container/user-uuid/doc-uuid.pdf",
      "size": 102450,
      "mimeType": "application/pdf",
      "type": "RESUME",
      "isDefault": false
    }
  ]
}
```

#### `GET /documents/:id`
Retrieve details of a single document by ID.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae575b81-d147-4952-b88a-36b3df5e975a",
    "name": "resume.pdf",
    "url": "https://storage.blob.core.windows.net/container/user-uuid/doc-uuid.pdf",
    "size": 102450,
    "mimeType": "application/pdf",
    "type": "RESUME",
    "isDefault": false
  }
}
```

#### `PATCH /documents/:id/default`
Set a document as the default for its type (e.g. default Resume). Toggles other documents of the same type for this user to `isDefault: false`.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae575b81-d147-4952-b88a-36b3df5e975a",
    "name": "resume.pdf",
    "type": "RESUME",
    "isDefault": true
  }
}
```

#### `DELETE /documents/:id`
Delete a document. Deletes the item from Azure Blob Storage and removes the record from database.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 📝 Activities

#### `GET /activities`
List all activities belonging to the authenticated user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ae585b81-d147-4952-b88a-36b3df5e975a",
      "type": "STATUS_CHANGE",
      "content": "Job status updated to APPLIED",
      "metadata": {
        "from": "WISHLIST",
        "to": "APPLIED"
      },
      "createdAt": "2026-08-09T19:00:00.000Z",
      "updatedAt": "2026-08-09T19:00:00.000Z",
      "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a",
      "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
    }
  ]
}
```

#### `GET /jobs/:jobId/activities`
List all activities associated with a specific job, scoped to user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ae585b81-d147-4952-b88a-36b3df5e975a",
      "type": "NOTE",
      "content": "Talked to the recruiter today.",
      "createdAt": "2026-08-09T19:10:00.000Z",
      "updatedAt": "2026-08-09T19:10:00.000Z",
      "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a",
      "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
    }
  ]
}
```

#### `POST /activities/notes`
Add a custom text note activity.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "content": "Followed up with engineering manager via email.",
  "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ae595b81-d147-4952-b88a-36b3df5e975a",
    "type": "NOTE",
    "content": "Followed up with engineering manager via email.",
    "userId": "7ac15b81-d147-4952-b88a-36b3df5e975a",
    "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a",
    "createdAt": "2026-08-09T19:20:00.000Z"
  }
}
```

---

### ⏰ Reminders

#### `POST /reminders`
Create a new reminder. Triggers a transaction-bound `REMINDER_CREATED` activity log automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "title": "Prepare portfolio presentation",
  "dueAt": "2026-08-12T10:00:00.000Z",
  "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "be565b81-d147-4952-b88a-36b3df5e975a",
    "title": "Prepare portfolio presentation",
    "dueAt": "2026-08-12T10:00:00.000Z",
    "completed": false,
    "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `GET /reminders`
List reminders for the user, with support for filtering by completed status, due date limits, and job.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Query Parameters**:
  - `completed`: Filter by completed state (`true`/`false`)
  - `dueBefore`: ISO 8601 date string
  - `dueAfter`: ISO 8601 date string
  - `jobId`: UUID string
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "be565b81-d147-4952-b88a-36b3df5e975a",
      "title": "Prepare portfolio presentation",
      "dueAt": "2026-08-12T10:00:00.000Z",
      "completed": false,
      "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
    }
  ]
}
```

#### `GET /reminders/:id`
Retrieve details of a single reminder.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "be565b81-d147-4952-b88a-36b3df5e975a",
    "title": "Prepare portfolio presentation",
    "dueAt": "2026-08-12T10:00:00.000Z",
    "completed": false,
    "jobId": "8dc35b81-d147-4952-b88a-36b3df5e975a"
  }
}
```

#### `PATCH /reminders/:id`
Update a reminder.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "title": "Update portfolio presentation title"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "be565b81-d147-4952-b88a-36b3df5e975a",
    "title": "Update portfolio presentation title",
    "dueAt": "2026-08-12T10:00:00.000Z",
    "completed": false
  }
}
```

#### `PATCH /reminders/:id/complete`
Shortcut endpoint to complete a reminder.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "be565b81-d147-4952-b88a-36b3df5e975a",
    "completed": true
  }
}
```

#### `DELETE /reminders/:id`
Delete a reminder.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

---

### 📋 Templates

#### `POST /templates`
Create a new template. Placeholder variables inside double curly brackets `{{variableName}}` will be parsed and stored automatically.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "name": "Intro Email",
  "subject": "Applying at {{company}}",
  "body": "Hello {{name}}, I would like to apply for the {{jobTitle}} position.",
  "type": "EMAIL"
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ce565b81-d147-4952-b88a-36b3df5e975a",
    "name": "Intro Email",
    "subject": "Applying at {{company}}",
    "body": "Hello {{name}}, I would like to apply for the {{jobTitle}} position.",
    "type": "EMAIL",
    "variables": ["company", "name", "jobTitle"]
  }
}
```

#### `GET /templates`
List all templates belonging to the authenticated user.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ce565b81-d147-4952-b88a-36b3df5e975a",
      "name": "Intro Email",
      "subject": "Applying at {{company}}",
      "body": "Hello {{name}}, I would like to apply for the {{jobTitle}} position.",
      "type": "EMAIL",
      "variables": ["company", "name", "jobTitle"]
    }
  ]
}
```

#### `GET /templates/:id`
Retrieve details of a single template by ID.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ce565b81-d147-4952-b88a-36b3df5e975a",
    "name": "Intro Email",
    "subject": "Applying at {{company}}",
    "body": "Hello {{name}}, I would like to apply for the {{jobTitle}} position.",
    "type": "EMAIL",
    "variables": ["company", "name", "jobTitle"]
  }
}
```

#### `PATCH /templates/:id`
Update a template. Placeholder variables will be re-parsed if subject or body changes.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Request Body**:
```json
{
  "body": "Hello {{name}}, I'm interested in the {{jobTitle}} role. Please check my portfolio at {{portfolioUrl}}."
}
```
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "id": "ce565b81-d147-4952-b88a-36b3df5e975a",
    "name": "Intro Email",
    "subject": "Applying at {{company}}",
    "body": "Hello {{name}}, I'm interested in the {{jobTitle}} role. Please check my portfolio at {{portfolioUrl}}.",
    "type": "EMAIL",
    "variables": ["company", "name", "jobTitle", "portfolioUrl"]
  }
}
```

#### `DELETE /templates/:id`
Delete a template.

* **Authorization**: Bearer JWT Token (`Authorization: Bearer <token>`)
* **Response Body**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

### 🏥 Health Check

#### `GET /health`
Inspect application health, Redis connection state, and queue visibility.

* **Response Body**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-09T23:13:00.000Z",
  "redis": {
    "status": "connected"
  },
  "queues": {
    "email": {
      "name": "email.queue",
      "isReady": true
    },
    "reminder": {
      "name": "reminder.queue",
      "isReady": true
    }
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
