/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'prisma', '@prisma/client']
  },
  webpack: (config) => {
    config.externals.push('bcryptjs')
    return config
  }
};

export default nextConfig;
