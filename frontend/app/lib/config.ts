// On Vercel, frontend and backend deploy as path-routed services on one
// domain (see root vercel.json), so NEXT_PUBLIC_API_URL is set to "" there
// (via next.config.ts) and the browser resolves /api/* same-origin.
// Locally, it's unset and falls back to the backend's own dev port.
export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const isServer = typeof window === "undefined";

// A relative base works for the browser (resolves against the page's own
// origin), but Node's server-side fetch has no implicit origin and throws
// "Failed to parse URL" on a relative path — SSR/route-handler calls need
// an absolute URL even when the browser is fine with a same-origin one.
function vercelRuntimeBase(): string | undefined {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return undefined;
}

const rawBase = NEXT_PUBLIC_API_URL.replace(/\/$/, "");
const API_BASE =
  isServer && !rawBase ? vercelRuntimeBase() ?? "http://localhost:4000" : rawBase;

export const API_URL = API_BASE; // full backend base URL
export const GRAPHQL_URL = `${API_BASE}/api/graphql`;
export const UPLOAD_URL = `${API_BASE}/api/upload`;

const config = {
  API_URL,
  GRAPHQL_URL,
  UPLOAD_URL,
};

export default config;
