/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // NOTE: /api/v1/* is served by the built-in catch-all route handler
  // (app/api/v1/[...slug]/route.ts). It proxies to a live FastAPI backend
  // when FASTAPI_BACKEND_URL is set and otherwise answers from the
  // calibrated GCC dataset, so the hosted demo is fully self-contained.
  // A previous afterFiles rewrite to the AWS Lambda shadowed that handler
  // (afterFiles rewrites run before dynamic routes), surfacing raw backend
  // 5xx errors to the UI whenever the data service degraded.
};

module.exports = nextConfig;
