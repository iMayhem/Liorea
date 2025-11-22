import type {NextConfig} from 'next';
const {headers} = require('./headers');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', port: '' },
      { protocol: 'https', hostname: 'api.dicebear.com', port: '' },
      { protocol: 'https', hostname: 'i.ytimg.com', port: '' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '' },
      // Add your Supabase Storage domain here:
      { 
        protocol: 'https', 
        hostname: 'kbebktodjwmzclhtnvas.supabase.co', 
        port: '' 
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: headers || [],
      }
    ];
  },
};

export default nextConfig;