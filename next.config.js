/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Firebase Storage public URLs
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prefer browser builds and avoid pulling in node-only deps like undici on client
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.alias = config.resolve.alias || {}
      // Prevent client bundle from resolving undici (node-only)
      config.resolve.alias['undici'] = false
      // Prefer browser fields when resolving packages
      config.resolve.mainFields = ['browser', 'module', 'main']
      // Ensure condition resolution prefers browser
      if (Array.isArray(config.resolve.conditionNames)) {
        const names = config.resolve.conditionNames.filter(Boolean)
        if (!names.includes('browser')) names.unshift('browser')
        config.resolve.conditionNames = names
      }
    }
    return config
  }
}

module.exports = nextConfig