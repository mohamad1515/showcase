export const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Ensure no trailing slash
const API_BASE = NEXT_PUBLIC_API_URL.replace(/\/$/, "");

export const API_URL = API_BASE; // full backend base URL
export const GRAPHQL_URL = `${API_BASE}/graphql`;
export const UPLOAD_URL = `${API_BASE}/upload`;

export default {
  API_URL,
  GRAPHQL_URL,
  UPLOAD_URL,
};
