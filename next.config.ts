
import type {NextConfig} from 'next';
const {headers, staticAssetHeaders, imageAssetHeaders} = require('./headers');

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
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: headers,
      },
      {
        source: '/_next/static/:path*',
        headers: staticAssetHeaders,
      },
      {
        // Next image optimizer path
        source: '/_next/image',
        headers: imageAssetHeaders,
      }
    ];
  },
};

export default nextConfig;
