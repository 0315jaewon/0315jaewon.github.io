/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/research-planner" : undefined,
  assetPrefix: isProd ? "/research-planner/" : undefined,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
