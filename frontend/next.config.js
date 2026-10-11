/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    const backendUrl = process.env.FASTAPI_BACKEND_URL || "https://uwpjoljajktr7pv7otc4rk7ofq0eapix.lambda-url.ap-southeast-2.on.aws";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl.replace(/\/+$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
