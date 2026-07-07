# Quick Reference: Backend URL Configuration

## Cheat Sheet for Common Tasks

### 🚀 Local Development Quick Start

```bash
# Backend (.env.local or .env.example defaults)
PORT=4000
BACKEND_PUBLIC_URL=http://localhost:4000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Both `npm run dev` and everything works. ✅

### 🌍 Deploying to Production

```bash
# Backend environment (Docker, Vercel, etc)
export NEXT_PUBLIC_API_URL=https://api.example.com
export BACKEND_PUBLIC_URL=https://api.example.com

# Frontend build-time environment
export NEXT_PUBLIC_API_URL=https://api.example.com
```

No code changes needed. Just env vars. ✅

### 📍 All URL Endpoints

| Endpoint                              | Source           | Used For                  |
| ------------------------------------- | ---------------- | ------------------------- |
| `{NEXT_PUBLIC_API_URL}/graphql`       | Frontend config  | GraphQL queries/mutations |
| `{NEXT_PUBLIC_API_URL}/upload`        | Frontend config  | File uploads              |
| `{BACKEND_PUBLIC_URL}/uploads/{file}` | Backend response | File download URLs        |

### 🔧 Adding a New Service URL

**Example**: Adding a WebSocket endpoint

1. **Update config** (`frontend/app/lib/config.ts`):

   ```typescript
   export const WS_URL = `ws://${API_BASE.replace(/^https?:\/\//, "")}`;
   ```

2. **Use it**:
   ```typescript
   import { WS_URL } from "../../lib/config";
   const ws = new WebSocket(WS_URL);
   ```

Done. ✅

### 🐛 Debugging: What URL is being used?

**Frontend**:

```typescript
import { GRAPHQL_URL, UPLOAD_URL } from "../../lib/config";
console.log("GraphQL:", GRAPHQL_URL);
console.log("Upload:", UPLOAD_URL);
```

**Browser DevTools**:

1. Open Network tab
2. Look at request URLs - they should match your `NEXT_PUBLIC_API_URL`

**Backend**:

1. Check startup logs (should show correct `BACKEND_PUBLIC_URL`)
2. Upload a file and check response URL

### ❓ Environment Variable Reference

| Variable              | Used By      | Must Set?                       | Examples                                           |
| --------------------- | ------------ | ------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Frontend     | No (defaults to localhost:4000) | `http://localhost:4000`, `https://api.example.com` |
| `BACKEND_PUBLIC_URL`  | Backend      | No (defaults to localhost:4000) | `http://localhost:4000`, `https://api.example.com` |
| `FRONTEND_URL`        | Backend CORS | No (defaults to localhost:3000) | `http://localhost:3000`, `https://app.example.com` |
| `PORT`                | Backend      | No (defaults to 4000)           | `3000`, `8000`, `5000`                             |

### 💡 Pro Tips

**Tip 1**: Both frontend and backend URLs usually match in production

```env
# Both access the same API
NEXT_PUBLIC_API_URL=https://api.example.com
BACKEND_PUBLIC_URL=https://api.example.com
```

**Tip 2**: Use different ports in development if needed

```env
# Frontend on 3000, Backend on 5000
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_PUBLIC_URL=http://localhost:5000
PORT=5000
```

**Tip 3**: File URLs are constructed by backend

- Front-end just sends filename from upload response
- Backend returns full URL: `${BACKEND_PUBLIC_URL}/uploads/filename`
- This ensures file URLs work in any deployment environment

**Tip 4**: CORS errors mean frontend and backend URLs don't match

```
❌ CORS Error → Check NEXT_PUBLIC_API_URL matches backend
✅ Set FRONTEND_URL on backend to match where frontend is hosted
```

### 🔍 File Locations

| File                         | Purpose          | Edit?                          |
| ---------------------------- | ---------------- | ------------------------------ |
| `frontend/app/lib/config.ts` | URL config logic | Only if adding new URL types   |
| `frontend/.env.local`        | Frontend env     | Yes, set `NEXT_PUBLIC_API_URL` |
| `backend/.env.local`         | Backend env      | Yes, set `BACKEND_PUBLIC_URL`  |
| `.env.example`               | Defaults         | Reference only                 |
| `ENVIRONMENT_SETUP.md`       | Full guide       | Reference only                 |

### 📝 Common Configurations

#### Docker Compose

```yaml
services:
  backend:
    environment:
      PORT: 4000
      BACKEND_PUBLIC_URL: http://backend:4000 # Internal
      FRONTEND_URL: http://localhost:3000

  frontend:
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000 # External (from host)
```

#### Vercel Deployment

```bash
# Set these in Vercel dashboard Environment Variables
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Railway Deployment

```yaml
# railway.toml or env
NEXT_PUBLIC_API_URL=${BACKEND_URL}  # Railway provides this
BACKEND_PUBLIC_URL=${BACKEND_URL}
```

### ✨ Before & After

**Before** (Hardcoded):

```typescript
// ❌ Scattered throughout code
const api = "http://localhost:4000";
const graphql = "http://localhost:4000/graphql";
const upload = "http://localhost:4000/upload";
```

**After** (Centralized):

```typescript
// ✅ One place
import { GRAPHQL_URL, UPLOAD_URL } from "../../lib/config";
```

One change to env → everything updates. 🎉

---

**For full details, see `ENVIRONMENT_SETUP.md`**
