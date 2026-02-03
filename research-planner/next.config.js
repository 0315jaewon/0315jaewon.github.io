/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === "1";

const nextConfig = {
  ...(isVercel ? {} : { output: "export", trailingSlash: true }),
  basePath: "/research-planner",
  assetPrefix: "/research-planner/",
  images: { unoptimized: true },
};

module.exports = nextConfig;
