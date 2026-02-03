/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isProd ? "/research-planner" : undefined,
  assetPrefix: isProd ? "/research-planner/" : undefined,
  images: { unoptimized: true },

  async redirects() {
    // When basePath is enabled, make the root URL go to the basePath
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
