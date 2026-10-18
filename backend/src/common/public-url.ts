export function getBackendPublicUrl(port: number): string {
  if (process.env.BACKEND_PUBLIC_URL) {
    return process.env.BACKEND_PUBLIC_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return `http://localhost:${port}/api`;
}
