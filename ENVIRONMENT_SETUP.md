# Environment Configuration Guide

## Overview

This project uses centralized environment variables to manage backend and frontend API endpoints. All URLs to backend resources are managed through environment variables to support easy deployment across different environments (development, staging, production).

## Environment Variables

### Frontend Configuration

Located in: `frontend/.env.local` (or check `.env.example` for defaults)

#### `NEXT_PUBLIC_API_URL`

- **Purpose**: Base URL for backend API server
- **Type**: Public (accessible in browser)
- **Default**: `http://localhost:4000`
- **Example**:
  - Development: `http://localhost:4000`
  - Staging: `https://api-staging.example.com`
  - Production: `https://api.example.com`

**Derived URLs** (auto-generated in `frontend/app/lib/config.ts`):

- `GRAPHQL_URL`: `${NEXT_PUBLIC_API_URL}/graphql` → GraphQL API endpoint
- `UPLOAD_URL`: `${NEXT_PUBLIC_API_URL}/upload` → File upload endpoint

### Backend Configuration

Located in: `backend/.env.example` (or create a `.env.local` file)

#### `PORT`

- **Purpose**: Port on which backend server listens
- **Type**: Private (server-only)
- **Default**: `4000`
- **Example**: `5000`, `8000`, etc.

#### `FRONTEND_URL`

- **Purpose**: Frontend URL for CORS (Cross-Origin Resource Sharing)
- **Type**: Private (server-only)
- **Default**: `http://localhost:3000`
- **Used for**: Allowing requests from frontend to backend

#### `BACKEND_PUBLIC_URL`

- **Purpose**: Public-facing backend URL (used in file URLs and startup logs)
- **Type**: Private (server-only, but returned to frontend in responses)
- **Default**: `http://localhost:${PORT}` (if not provided)
- **Used for**:
  - File upload responses (e.g., `/uploads/filename` URLs)
  - Server startup console logs
- **Example**:
  - Development: `http://localhost:4000`
  - Production: `https://api.example.com`

## Configuration Files

### Central Configuration Module

**File**: `frontend/app/lib/config.ts`

This file reads environment variables and exports constants for use throughout the application:

```typescript
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const API_URL = NEXT_PUBLIC_API_URL.replace(/\/$/, ""); // no trailing slash
export const GRAPHQL_URL = `${API_URL}/graphql`;
export const UPLOAD_URL = `${API_URL}/upload`;
```

**Usage**: Instead of hardcoding URLs or accessing `process.env` directly, import from this config:

```typescript
import { GRAPHQL_URL, UPLOAD_URL } from "../../lib/config";
```

## Setup Instructions

### Development Environment

1. **Backend Setup** (`backend` folder):

   ```bash
   # Copy environment example
   cp .env.example .env.local

   # Edit if needed (usually defaults are fine)
   # PORT=4000
   # FRONTEND_URL=http://localhost:3000
   # BACKEND_PUBLIC_URL=http://localhost:4000
   ```

2. **Frontend Setup** (`frontend` folder):

   ```bash
   # Copy environment example
   cp .env.example .env.local

   # Default should work for local development:
   # NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Start the servers**:

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   # Server runs on http://localhost:4000

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   # App runs on http://localhost:3000
   ```

### Production Deployment

1. **Backend**:

   ```env
   PORT=80  # or use reverse proxy
   FRONTEND_URL=https://app.example.com  # your frontend domain
   BACKEND_PUBLIC_URL=https://api.example.com  # your backend domain
   ```

2. **Frontend** (via deployment platform or build process):
   ```env
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

## How URLs Are Used

### GraphQL Queries

```typescript
// frontend/app/lib/graphql.ts
import { GRAPHQL_URL } from "./config";

const response = await fetch(GRAPHQL_URL, {
  method: "POST",
  body: JSON.stringify({ query, variables }),
});
```

### File Uploads

```typescript
// frontend/app/components/admin/ProductForm.tsx
import { UPLOAD_URL } from "../../lib/config";

<FilePond
  server={{
    process: {
      url: UPLOAD_URL,  // Posts to ${NEXT_PUBLIC_API_URL}/upload
      // ...
    },
  }}
/>
```

### Backend File URLs

```typescript
// backend/src/upload/upload.controller.ts
const backendPublicUrl =
  process.env.BACKEND_PUBLIC_URL ??
  `http://localhost:${process.env.PORT ?? 4000}`;

return {
  success: true,
  url: `${backendPublicUrl}/uploads/${file.filename}`,
};
```

## Zero-Hardcoding Principle

✅ **Centralized**: All API URLs come from environment variables
✅ **Single Source of Truth**: `NEXT_PUBLIC_API_URL` for frontend, `BACKEND_PUBLIC_URL` for backend
✅ **No Service-Specific Hardcoding**: Services like GraphQL and file upload derive their URLs from the base URL
✅ **Environment-Aware Defaults**: Provides sensible development defaults while supporting any production URL

### URL Resolution Flow

```
environment variable
       ↓
frontend/app/lib/config.ts (exports GRAPHQL_URL, UPLOAD_URL, etc)
       ↓
Services use these constants (no direct process.env or hardcoded URLs)
       ↓
User-facing responses from backend use BACKEND_PUBLIC_URL
```

## Verification

To verify all URLs are properly configured:

1. **Frontend**: Check browser DevTools Network tab - all requests should go to `NEXT_PUBLIC_API_URL`
2. **Backend**: Check startup logs for correct `BACKEND_PUBLIC_URL`
3. **File Uploads**: Uploaded files should have correct URLs in responses

## Troubleshooting

### Frontend can't reach backend

- Check `NEXT_PUBLIC_API_URL` matches backend `PORT` and `BACKEND_PUBLIC_URL`
- Browser console should show the URL it's trying to reach
- Ensure `FRONTEND_URL` on backend allows the frontend domain (CORS)

### File uploads return incorrect URLs

- Check `BACKEND_PUBLIC_URL` is set correctly
- File response should contain full URL like `https://api.example.com/uploads/filename.jpg`
- If using proxy/load balancer, ensure it matches your `BACKEND_PUBLIC_URL`

### Production URLs not working

- Verify env vars are actually set in deployment (don't rely on `.env.example`)
- Backend should log correct URLs at startup: `Backend is running on ${backendPublic}`
- Frontend should be built with correct `NEXT_PUBLIC_API_URL` at build time
