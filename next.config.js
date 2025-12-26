const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'madebydesignesia.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Allow localhost for development
    domains: ['localhost', 'res.cloudinary.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow unoptimized images from localhost
    unoptimized: false,
  },
  // Compression
  compress: true,
  // Security headers
  poweredByHeader: false,
  // Minification
  swcMinify: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Webpack configuration for path aliases
  webpack: (config) => {
    const alias = config.resolve.alias || {}
    alias['@'] = path.resolve(__dirname)
    config.resolve.alias = alias
    return config
  },
}

module.exports = nextConfig

