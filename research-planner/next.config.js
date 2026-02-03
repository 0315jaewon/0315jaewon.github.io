/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  basePath: isProd ? "/research-planner" : undefined,
  assetPrefix: isProd ? "/research-planner/" : undefined,
  images: { unoptimized: true },

  async redirects() {
    return isProd
      ? [
          {
            source: "/",
            destination: "/research-planner",
            permanent: false,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
