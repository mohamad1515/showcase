// On Vercel, frontend and backend deploy as path-routed services on one
// domain (see root vercel.json), so NEXT_PUBLIC_API_URL is set to "" there
// and these resolve to same-origin /api/* paths. Locally, it's unset and
// falls back to the backend's own dev port. Use `??`, not `||`, so an
// explicit empty string isn't treated as unset.
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Ensure no trailing slash
const API_BASE = NEXT_PUBLIC_API_URL.replace(/\/$/, "");

export const API_URL = API_BASE; // full backend base URL
export const GRAPHQL_URL = `${API_BASE}/api/graphql`;
export const UPLOAD_URL = `${API_BASE}/api/upload`;

const config = {
  API_URL,
  GRAPHQL_URL,
  UPLOAD_URL,
};

export default config;
