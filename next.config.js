/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/read",
        permanent: true,
      },
    ];
  },
  images: {
    // Fix to only one size image in order to support pre-loading with next/image, since we need the image URL to be deterministic.
    deviceSizes: [1920],
  },
  output: "standalone",
};

export default config;
