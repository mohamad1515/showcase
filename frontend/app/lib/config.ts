// Frontend (Vercel) and backend (Render) are separate deployments on
// separate domains, so this is always an absolute URL in production — set
// NEXT_PUBLIC_API_URL to the Render backend's URL in the Vercel project's
// env vars. Locally it's unset and falls back to the backend's dev port.
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
