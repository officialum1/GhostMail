/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'prisma', '@prisma/client']
  }
};

export default nextConfig;
