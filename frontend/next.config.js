/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    if (process.env.FASTAPI_BACKEND_URL) {
      return [
        {
          source: "/api/v1/:path*",
          destination: `${process.env.FASTAPI_BACKEND_URL}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
