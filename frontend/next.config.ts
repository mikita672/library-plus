import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/library-plus/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/library-plus/**",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/library-plus/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: `/api/:path*`,
        destination: `${process.env.API_URL}/:path*`,
      }
    ];
  }
};

export default nextConfig;
