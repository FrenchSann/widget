/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright', '@axe-core/playwright'],
  },
}

export default nextConfig
