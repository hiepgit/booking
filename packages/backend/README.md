# @healthcare/backend

Backend service for Healthcare Booking.

## Quick start

1. Install deps at repo root:
   - `yarn install`

2. Create `packages/backend/.env` based on the variables below (see Env section).

3. Run dev:
   - `yarn workspace @healthcare/backend dev`

4. Swagger (if enabled):
   - `http://localhost:3001/docs`

5. Health check:
   - `GET http://localhost:3001/health`

## Env

Required/optional variables parsed via Zod in `src/config/env.ts`:

```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/booking?schema=public
SWAGGER_ENABLED=true
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

## Scripts

- `dev`: watch mode via tsx
- `build`: compile to `dist`
- `start`: run compiled server
- `db:seed`: run Prisma seed (configure `prisma/seed.ts` first)


## Auth endpoints (Phase 1)

- POST `/auth/register` { email, password, fullName, role }
- POST `/auth/verify-otp` { email, otp }
- POST `/auth/login` { email, password }
- POST `/auth/refresh` { refreshToken }
- GET `/me`
- PATCH `/me`


