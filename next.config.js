/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './app/lib/image-loader.ts',
    disableStaticImages: true, // Esto es importante para imágenes locales
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