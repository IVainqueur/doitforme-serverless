/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // webpack: (config, { webpack, isServer }) => {
  //   config.externals = config.externals.concat(['@slack/bolt', 'pine', 'pine-pretty']);
  //   return config;
  // },
}

export default nextConfig
