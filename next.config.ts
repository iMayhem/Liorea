import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-263c959737eb4c69b56dd748bbb8f7e9.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;
