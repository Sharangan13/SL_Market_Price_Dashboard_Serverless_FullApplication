/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Force new build IDs to prevent cache mismatches
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};
module.exports = nextConfig;
