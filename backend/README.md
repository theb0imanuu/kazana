# Kazana Backend — Phase 1

NestJS 11 API for Kazana, backed by PostgreSQL/Prisma and Redis/BullMQ.

Implemented:
- JWT registration/login/me
- bcrypt password hashing
- user profile
- jobs and pipeline status
- companies
- networking contacts
- interviews and contact relationships
- Azure Blob document uploads
- activity timeline
- reminders and daily BullMQ reminder processor
- email queue mock processor
- templates
- dashboard analytics
- global validation, logging, response transformation and exception handling
- health endpoint
- Docker/Podman-compatible multi-stage image
- Prisma migrations
- unit and e2e test scaffolding
