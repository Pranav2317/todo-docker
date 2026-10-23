/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal server bundle for a small Docker image
  output: "standalone",
};

module.exports = nextConfig;
