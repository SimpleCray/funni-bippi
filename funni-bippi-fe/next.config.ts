import type { NextConfig } from 'next';

const BE = process.env.NEXT_PUBLIC_BE_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${BE}/files/**`)],
  },
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok-free.app'],
};

export default nextConfig;
