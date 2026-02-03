/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const useExport = isProd && !isVercel;

const nextConfig = {
  ...(useExport ? { output: "export", trailingSlash: true } : {}),
  basePath: useExport ? "/research-planner" : undefined,
  assetPrefix: useExport ? "/research-planner/" : undefined,
  images: { unoptimized: true },
};

module.exports = nextConfig;
