import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // Check if we're running in Docker (frontend container)
    const isDocker = process.env.NODE_ENV === 'production' || process.env.DOCKER === 'true';
    
    return [
      {
        source: '/api/:path*',
        // In Docker: use service name 'api'
        // Locally: use localhost:4080
        destination: isDocker 
          ? 'http://api:3000/api/:path*'
          : 'http://localhost:4080/api/:path*',
      },
    ];
  },
};

export default nextConfig;