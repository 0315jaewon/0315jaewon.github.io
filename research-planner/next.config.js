/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/research-planner",
  assetPrefix: "/research-planner/",
  images: { unoptimized: true },
};

module.exports = nextConfig;
