/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;
