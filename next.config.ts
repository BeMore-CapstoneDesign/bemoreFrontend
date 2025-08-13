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
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP는 개발 편의상 느슨하게, 배포 시 엄격 정책으로 교체 권장
          { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src *;" },
        ],
      },
    ];
  },
};

export default nextConfig;
