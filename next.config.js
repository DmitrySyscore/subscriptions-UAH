/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {

    config.externals = config.externals || [];

    if (!isServer) {
      config.externals.push({
        handlebars: 'commonjs handlebars',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
