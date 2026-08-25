/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // A production build and `next dev` write incompatible artifacts. Sharing one
  // directory leaves whichever is running second looking for chunks the other
  // deleted ("Cannot find module './161.js'"), so a verification build can be
  // pointed elsewhere and leave a running dev server alone:
  //   NEXT_DIST_DIR=.next-build npm run build
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Ensure serverless function bundles include standard fonts and assets if needed
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
};

module.exports = nextConfig;
