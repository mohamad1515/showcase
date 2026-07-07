# URL Configuration Architecture & Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ENVIRONMENT                          │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  Development    │  │   Staging       │  │  Production     │        │
│  │                 │  │                 │  │                 │        │
│  │ localhost:3000  │  │ app-staging.com │  │ app.example.com │        │
│  │ localhost:4000  │  │ api-staging.com │  │ api.example.com │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         │ Environment          │ Environment          │ Environment
         │ Variables            │ Variables            │ Variables
         ↓                      ↓                      ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT CONFIGURATION LAYER                       │
│                                                                           │
│  NEXT_PUBLIC_API_URL     |  NEXT_PUBLIC_API_URL     |  NEXT_PUBLIC_API_URL
│  =localhost:4000         |  =api-staging.com        |  =api.example.com
│                          |                          |
│  BACKEND_PUBLIC_URL      |  BACKEND_PUBLIC_URL      |  BACKEND_PUBLIC_URL
│  =localhost:4000         |  =api-staging.com        |  =api.example.com
│                          |                          |
│  FRONTEND_URL            |  FRONTEND_URL            |  FRONTEND_URL
│  =localhost:3000         |  =app-staging.com        |  =app.example.com
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND CONFIGURATION LAYER                           │
│                                                                           │
│         frontend/app/lib/config.ts                                      │
│         ┌──────────────────────────────────────────────────────┐        │
│         │                                                       │        │
│         │  export const NEXT_PUBLIC_API_URL =                  │        │
│         │    process.env.NEXT_PUBLIC_API_URL ||                │        │
│         │    "http://localhost:4000"                          │        │
│         │                                                       │        │
│         │  export const API_URL = remove_trailing_slash(...)   │        │
│         │  export const GRAPHQL_URL = ${API_URL}/graphql       │        │
│         │  export const UPLOAD_URL = ${API_URL}/upload         │        │
│         │                                                       │        │
│         └──────────────────────────────────────────────────────┘        │
│                                                                           │
│         ✨ Single Source of Truth for Frontend URLs                      │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND SERVICES LAYER                           │
│                                                                           │
│  ┌───────────────────────┐  ┌───────────────────────┐                  │
│  │ GraphQL Client        │  │ File Upload Handler   │                  │
│  │                       │  │                       │                  │
│  │ import {              │  │ import {              │                  │
│  │   GRAPHQL_URL         │  │   UPLOAD_URL          │                  │
│  │ } from "./config"     │  │ } from "./config"     │                  │
│  │                       │  │                       │                  │
│  │ fetch(GRAPHQL_URL, {  │  │ <FilePond             │                  │
│  │   method: 'POST',     │  │   server={{           │                  │
│  │   ...                 │  │     process: {         │                  │
│  │ })                    │  │       url: UPLOAD_URL  │                  │
│  │                       │  │     }                  │                  │
│  │                       │  │   }}                   │                  │
│  └───────────────────────┘  └───────────────────────┘                  │
│                                                                           │
│         ✨ All services derive URLs from central config                  │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         NETWORK REQUESTS                                 │
│                                                                           │
│  For Development (localhost:4000):                                      │
│  ✓ POST localhost:4000/graphql                                          │
│  ✓ POST localhost:4000/upload                                           │
│                                                                           │
│  For Staging (api-staging.com):                                         │
│  ✓ POST https://api-staging.com/graphql                                 │
│  ✓ POST https://api-staging.com/upload                                  │
│                                                                           │
│  For Production (api.example.com):                                      │
│  ✓ POST https://api.example.com/graphql                                 │
│  ✓ POST https://api.example.com/upload                                  │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND RESPONSE LAYER                            │
│                                                                           │
│  backend/src/upload/upload.controller.ts                                │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │                                                           │           │
│  │  const backendPublicUrl =                                │           │
│  │    process.env.BACKEND_PUBLIC_URL ??                     │           │
│  │    `http://localhost:${process.env.PORT ?? 4000}`        │           │
│  │                                                           │           │
│  │  return {                                                │           │
│  │    success: true,                                        │           │
│  │    url: `${backendPublicUrl}/uploads/${file.filename}`   │           │
│  │  }                                                        │           │
│  │                                                           │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                           │
│  ✨ Backend constructs URLs using BACKEND_PUBLIC_URL                    │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     FILE URL RESPONSES TO CLIENT                        │
│                                                                           │
│  Development:                                                           │
│  {                                                                       │
│    "success": true,                                                     │
│    "url": "http://localhost:4000/uploads/1234567890-file.jpg"          │
│  }                                                                       │
│                                                                           │
│  Staging:                                                               │
│  {                                                                       │
│    "success": true,                                                     │
│    "url": "https://api-staging.com/uploads/1234567890-file.jpg"        │
│  }                                                                       │
│                                                                           │
│  Production:                                                            │
│  {                                                                       │
│    "success": true,                                                     │
│    "url": "https://api.example.com/uploads/1234567890-file.jpg"        │
│  }                                                                       │
│                                                                           │
│  ✨ Correct URLs returned regardless of backend deployment              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Sets Environment Variables
         ↓
┌─────────────────────────────────────────────────┐
│  .env files / Platform Settings                 │
│                                                  │
│  NEXT_PUBLIC_API_URL=https://api.example.com   │
│  BACKEND_PUBLIC_URL=https://api.example.com    │
│  FRONTEND_URL=https://app.example.com          │
└─────────────────────────────────────────────────┘
         ↓
         ├─ Frontend Reads @Build Time ────────────┐
         │                                           │
         │  process.env.NEXT_PUBLIC_API_URL         │
         │                                           │
         ↓                                           │
    ┌─────────────────────────────────────────────┐ │
    │ frontend/app/lib/config.ts                  │ │
    │                                             │ │
    │ Generates:                                  │ │
    │ • GRAPHQL_URL                              │ │
    │ • UPLOAD_URL                               │ │
    │ • API_URL                                  │ │
    └─────────────────────────────────────────────┘ │
         ↓                                           │
    Embedded in Build Artifacts                     │
         ↓                                           │
    Deployed to CDN/Server                          │
         ↓                                           │
    Browser Receives                                │
    (URLs embedded at build time)                   │
         ↓                                           │
    Components Import Config ←────────────────────┘
    and Use Embedded URLs
         ↓
    Requests Sent to Backend


Backend Process:
         ↓
┌─────────────────────────────────────────────────┐
│  Backend Reads Environment Variables             │
│                                                  │
│  process.env.PORT                              │
│  process.env.BACKEND_PUBLIC_URL                │
│  process.env.FRONTEND_URL                      │
└─────────────────────────────────────────────────┘
         ↓
    Server Initializes
         ↓
    CORS Configured with FRONTEND_URL
         ↓
    Listens on PORT
         ↓
    Logs to Console using BACKEND_PUBLIC_URL
         ↓
    Request Received (e.g., file upload)
         ↓
    Response Generated
         ↓
    File URL Built: ${BACKEND_PUBLIC_URL}/uploads/...
         ↓
    Returned to Client
         ↓
    Client Downloads File from URL
```

## Environment Variable Resolution

```
SCENARIO: Deploying to Production

Step 1: Configuration
────────────────────────────────────
Environment: Production (cloud platform)
Domain: api.example.com

Step 2: Set Environment Variables
────────────────────────────────────
Frontend (build time):
  NEXT_PUBLIC_API_URL = https://api.example.com

Backend (runtime):
  BACKEND_PUBLIC_URL = https://api.example.com
  FRONTEND_URL = https://app.example.com
  PORT = 443 (or 80, behind proxy)

Step 3: Frontend Build
────────────────────────────────────
config.ts reads: process.env.NEXT_PUBLIC_API_URL
Result:
  GRAPHQL_URL = "https://api.example.com/graphql"
  UPLOAD_URL = "https://api.example.com/upload"

URLs are hardcoded into JavaScript bundle ✓

Step 4: Frontend Deployed
────────────────────────────────────
JavaScript bundle contains:
  const GRAPHQL_URL = "https://api.example.com/graphql"
  const UPLOAD_URL = "https://api.example.com/upload"

Served to: https://app.example.com

Step 5: Browser Requests
────────────────────────────────────
Query: fetch("https://api.example.com/graphql", {...})
Upload: fetch("https://api.example.com/upload", {...})

CORS check:
  Origin: https://app.example.com ✓
  Allowed? Check Backend FRONTEND_URL ✓

Step 6: Backend Processes Request
────────────────────────────────────
File Upload Response:
  {
    success: true,
    url: "https://api.example.com/uploads/abc123.jpg"
  }

Built from: ${process.env.BACKEND_PUBLIC_URL}/uploads/...

Step 7: Browser Downloads File
────────────────────────────────────
Request: GET https://api.example.com/uploads/abc123.jpg
Response: File served from /public/uploads/abc123.jpg

✅ Everything works seamlessly across all environments!
```

## Component Dependency Graph

```
frontend/
  ├── app/
  │   ├── lib/
  │   │   ├── config.ts ★
  │   │   │   ├── Exports: GRAPHQL_URL, UPLOAD_URL, API_URL
  │   │   │   └── Reads: process.env.NEXT_PUBLIC_API_URL
  │   │   │
  │   │   ├── graphql.ts
  │   │   │   ├── Imports: { GRAPHQL_URL } from './config'
  │   │   │   └── Uses: GRAPHQL_URL for all GraphQL requests
  │   │   │
  │   │   └── products.ts
  │   │       └── Uses: graphql exported functions
  │   │
  │   ├── components/
  │   │   ├── admin/
  │   │   │   └── ProductForm.tsx
  │   │   │       ├── Imports: { UPLOAD_URL } from '../../lib/config'
  │   │   │       └── Uses: UPLOAD_URL for FilePond
  │   │   │
  │   │   ├── ProductCard.tsx
  │   │   │   └── Uses: image URLs from GraphQL responses
  │   │   │
  │   │   └── SliderHero.tsx
  │   │       └── Uses: image URLs from GraphQL responses
  │   │
  │   └── page.tsx, */page.tsx
  │       └── Use: functions from lib/products.ts
  │           which use GRAPHQL_URL from config
  │
  └── .env.local
      └── NEXT_PUBLIC_API_URL=http://localhost:4000

backend/
  ├── src/
  │   ├── main.ts ★
  │   │   └── Uses: process.env.BACKEND_PUBLIC_URL for logs
  │   │
  │   ├── upload/
  │   │   └── upload.controller.ts ★
  │   │       └── Uses: process.env.BACKEND_PUBLIC_URL for file URLs
  │   │
  │   ├── auth/
  │   │   └── Uses: process.env.FRONTEND_URL for CORS
  │   │
  │   └── ...
  │
  └── .env.local
      ├── BACKEND_PUBLIC_URL=http://localhost:4000
      ├── FRONTEND_URL=http://localhost:3000
      └── PORT=4000

★ = Files that read environment variables directly
    All others derive URLs from these central sources
```

## Key Environment Variables Mapping

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND ENVIRONMENT VARIABLES                          │
├─────────────────────────────────────────────────────────┤
│ Name: NEXT_PUBLIC_API_URL                              │
│ Purpose: Backend base URL                              │
│ Read By: frontend/app/lib/config.ts                    │
│ Derived URLs:                                          │
│   • GRAPHQL_URL = ${NEXT_PUBLIC_API_URL}/graphql       │
│   • UPLOAD_URL = ${NEXT_PUBLIC_API_URL}/upload         │
│ Used In:                                               │
│   • graphql.ts (all queries/mutations)                │
│   • ProductForm.tsx (file uploads)                    │
│   • All components making API calls                   │
│ When to Change: Different backend or port             │
│ Example Values:                                        │
│   • http://localhost:4000 (dev)                       │
│   • https://api-staging.com (staging)                 │
│   • https://api.example.com (prod)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BACKEND ENVIRONMENT VARIABLES                           │
├─────────────────────────────────────────────────────────┤
│ Name: BACKEND_PUBLIC_URL                               │
│ Purpose: Public URL for file uploads & logs            │
│ Read By: upload.controller.ts, main.ts                │
│ Used For:                                              │
│   • File upload responses (/uploads/filename)         │
│   • Startup logs (console output)                     │
│ When to Change: Different deployment domain           │
│ Example Values:                                        │
│   • http://localhost:4000 (dev)                       │
│   • https://api-staging.com (staging)                 │
│   • https://api.example.com (prod)                    │
│                                                         │
│ Name: PORT                                             │
│ Purpose: Server listen port                           │
│ Default: 4000 (used if BACKEND_PUBLIC_URL not set)    │
│ Example Values: 3000, 4000, 5000, 8000, 443          │
│                                                         │
│ Name: FRONTEND_URL                                     │
│ Purpose: CORS allowed origin                          │
│ Used For: app.enableCors({ origin: FRONTEND_URL })    │
│ Example Values:                                        │
│   • http://localhost:3000 (dev)                       │
│   • https://app-staging.com (staging)                 │
│   • https://app.example.com (prod)                    │
└─────────────────────────────────────────────────────────┘
```

---

**For implementation details, see `URL_CENTRALIZATION_SUMMARY.md`**
**For setup instructions, see `ENVIRONMENT_SETUP.md`**
**For quick reference, see `URL_QUICK_REFERENCE.md`**
