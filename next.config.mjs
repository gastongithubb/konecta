/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['media.giphy.com'],
  },
  async redirects() {
    return [
      {
        source: '/unauthorized',
        destination: '/unauthorized',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/:path*',
        destination: '/dashboard/:path*',
      },
      {
        source: '/api/user',
        destination: '/api/user',
      },
    ];
  },
}

export default nextConfig;