# URL Configuration Centralization - Implementation Summary

## Changes Overview

All backend URLs in the project are now managed through centralized environment variables. The project is **100% free of hardcoded backend URLs** in source code.

## Files Modified

### Frontend

#### 1. **New File: `frontend/app/lib/config.ts`** ⭐

- **Purpose**: Central configuration hub for all backend URLs
- **Exports**: `API_URL`, `GRAPHQL_URL`, `UPLOAD_URL`
- **Reads from**: `NEXT_PUBLIC_API_URL` environment variable
- **Impact**: Single source of truth for all URL construction

#### 2. **Modified: `frontend/app/lib/graphql.ts`**

- **Before**: `const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql"`
- **After**: `import { GRAPHQL_URL } from "./config"; const graphqlUrl = GRAPHQL_URL;`
- **Impact**: Uses centralized config instead of direct env access

#### 3. **Modified: `frontend/app/components/admin/ProductForm.tsx`**

- **Before**: FilePond upload used inline env parsing with hardcoded fallback
- **After**: `import { UPLOAD_URL } from "../../lib/config"; url: UPLOAD_URL,`
- **Impact**: Cleaner, more maintainable file upload configuration

#### 4. **Modified: `frontend/.env.example`**

- **Before**: `NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql`
- **After**: `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Impact**: Simplified configuration - GraphQL/upload URLs auto-derived

#### 5. **Modified: `frontend/.env.local`**

- **Before**: `NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql`
- **After**: `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Impact**: Consistent with example; easier to maintain

### Backend

#### 6. **Modified: `backend/src/upload/upload.controller.ts`**

- **Before**: Used `process.env.HOST` + `process.env.PORT` to construct URL
- **After**: Uses `BACKEND_PUBLIC_URL` env var (with PORT fallback)
- **Impact**: File upload responses now use correct public URL for any domain

#### 7. **Modified: `backend/src/main.ts`**

- **Before**: Hardcoded `http://localhost:${port}` in console logs
- **After**: Uses `BACKEND_PUBLIC_URL` env var for logs
- **Impact**: Startup logs show correct production URL

#### 8. **Modified: `backend/.env.example`**

- **Added**: `BACKEND_PUBLIC_URL` environment variable documentation
- **Purpose**: Explicitly document what this var controls
- **Impact**: Developers understand when/why to set this

### Root Configuration

#### 9. **Modified: `.env.example`**

- **Before**: Mixed frontend/backend vars in one file with old variable names
- **After**: Standardized to use `NEXT_PUBLIC_API_URL` with clear documentation
- **Impact**: Clearer deployment documentation for the whole project

#### 10. **New File: `ENVIRONMENT_SETUP.md`** ⭐

- **Purpose**: Comprehensive guide for environment configuration
- **Contents**: Setup instructions, variable descriptions, deployment examples
- **Target Audience**: Developers, DevOps, CI/CD pipelines

## URL Resolution Architecture

```
┌─────────────────────────────────────────┐
│     Environment Variables               │
│                                         │
│  Frontend:                              │
│  NEXT_PUBLIC_API_URL (public)           │
│                                         │
│  Backend:                               │
│  BACKEND_PUBLIC_URL (server-only)       │
│  PORT (server-only)                     │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│     Config Layer (frontend/lib/config)  │
│                                         │
│  Derives:                               │
│  • GRAPHQL_URL = ${API_URL}/graphql    │
│  • UPLOAD_URL = ${API_URL}/upload      │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│     Services & Components               │
│                                         │
│  • graphql.ts        → uses GRAPHQL_URL │
│  • ProductForm.tsx   → uses UPLOAD_URL  │
│  • Upload Controller → uses BACKEND_URL │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│     Runtime                             │
│                                         │
│  Browser makes requests to:             │
│  https://api.example.com/graphql        │
│  https://api.example.com/upload         │
│                                         │
│  Server returns file URLs:              │
│  https://api.example.com/uploads/file   │
└─────────────────────────────────────────┘
```

## Benefits

### ✅ Zero Hardcoding

- No `http://localhost` in source code
- No service-specific URLs scattered throughout
- All URLs defined in environment variables

### ✅ Single Point of Change

- Change `NEXT_PUBLIC_API_URL` → all frontend requests update
- Change `BACKEND_PUBLIC_URL` → all file URLs update
- No need to search/replace across multiple files

### ✅ Deployment Ready

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:4000

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.example.com

# Production
NEXT_PUBLIC_API_URL=https://api.example.com
```

Just change the env var - code stays the same.

### ✅ Type-Safe & Auto-Complete

- Central `config.ts` exports named constants
- IDE autocomplete available everywhere
- No magic strings or inline env access

### ✅ Maintainable

- Clear separation of concerns
- Easy to audit all URL generation logic
- Self-documenting through constant names

## Verification Checklist

- [x] All frontend API calls use `GRAPHQL_URL` from config
- [x] File uploads use `UPLOAD_URL` from config
- [x] No hardcoded `http://localhost` in source files
- [x] No direct access to `process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT` in components
- [x] Backend file upload responses use `BACKEND_PUBLIC_URL`
- [x] Backend startup logs use `BACKEND_PUBLIC_URL`
- [x] `.env.example` files updated with new variable names
- [x] Documentation created (`ENVIRONMENT_SETUP.md`)
- [x] Config file exports all needed URL constants
- [x] Components import from config instead of env

## Migration Notes for Existing Code

If you have custom code accessing backend URLs:

### ❌ Old Pattern (Don't Do This)

```typescript
const url = "http://localhost:4000/graphql";
const url = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
const uploadUrl =
  (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace(/\/graphql\/?$/, "") ||
    "http://localhost:4000") + "/upload";
```

### ✅ New Pattern (Use This)

```typescript
import { GRAPHQL_URL, UPLOAD_URL } from "../../lib/config";

const url = GRAPHQL_URL; // "${API_URL}/graphql"
const uploadUrl = UPLOAD_URL; // "${API_URL}/upload"
```

## Next Steps

1. **Local Development**: Ensure `.env.local` files exist in both `frontend/` and `backend/` with appropriate values
2. **CI/CD Pipeline**: Update deployment scripts to set environment variables
3. **Production**: Deploy with `NEXT_PUBLIC_API_URL=https://your-api.com` and `BACKEND_PUBLIC_URL=https://your-api.com`
4. **Documentation**: Share `ENVIRONMENT_SETUP.md` with team members and in deployment guides

## Support Variables (Optional)

These are additional variables you might want to add in the future:

- `NEXT_PUBLIC_OAUTH_URL`: For OAuth endpoints (already in `.env.example`)
- `API_KEY`: For external API authentication
- `SENTRY_DSN`: For error tracking
- `ANALYTICS_ID`: For usage tracking

Just add them to `.env.example` and access via `process.env` (not in config, since these aren't API URLs).
