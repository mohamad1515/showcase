// Frontend (Vercel) and backend (Render) are separate deployments on
// separate domains, so NEXT_PUBLIC_API_URL is normally the same absolute
// URL for both the browser and server-side fetches — set it to the
// Render backend's URL in the Vercel project's env vars. Locally it's
// unset and falls back to the backend's dev port.
//
// INTERNAL_API_URL is an escape hatch for environments where the server
// and the browser can't reach the backend the same way — e.g. in
// docker-compose, the frontend container must reach the backend via the
// Docker network (http://graphql:4000), while the browser on the host
// must use the published port (http://localhost:4000). It's deliberately
// not NEXT_PUBLIC_-prefixed (server-only, read at request time, never
// inlined into the client bundle) and only takes effect server-side.
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const isServer = typeof window === "undefined";
const rawBase = NEXT_PUBLIC_API_URL.replace(/\/$/, "");
const API_BASE =
  isServer && process.env.INTERNAL_API_URL
    ? process.env.INTERNAL_API_URL.replace(/\/$/, "")
    : rawBase;

export const API_URL = API_BASE; // full backend base URL
export const GRAPHQL_URL = `${API_BASE}/api/graphql`;
export const UPLOAD_URL = `${API_BASE}/api/upload`;

const config = {
  API_URL,
  GRAPHQL_URL,
  UPLOAD_URL,
};

export default config;
