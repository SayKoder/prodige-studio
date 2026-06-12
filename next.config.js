/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
    localPatterns: [{ pathname: '/uploads/**' }],
  },
}

module.exports = nextConfig
