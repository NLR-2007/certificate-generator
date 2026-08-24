/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure serverless function bundles include standard fonts and assets if needed
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
};

module.exports = nextConfig;
