/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    domains: ['*'],
    loader: 'custom',
    loaderFile: './app/lib/image-loader.ts',
    disableStaticImages: true,
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
  webpack: (config, { isServer }) => {
    config.optimization.splitChunks = false;
    return config;
  },
}

module.exports = nextConfig;