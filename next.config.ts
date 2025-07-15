import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // 개발 모드에서 React 경고 숨기기
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom/client': require.resolve('react-dom/client'),
      };
    }
    return config;
  },
};

export default nextConfig;
