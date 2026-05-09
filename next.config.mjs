/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'tile.opentopomap.org',
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://*.firebase.com https://*.google.com https://*.firebaseio.com; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://*.firebase.com https://*.google.com https://*.firebaseio.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob: https://*.openstreetmap.org https://*.opentopomap.org https://*.google.com https://*.gstatic.com; font-src 'self' data:; connect-src 'self' https://nominatim.openstreetmap.org https://tile.openstreetmap.org https://tile.opentopomap.org https://drive.google.com https://firebaseinstallations.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://*.google-analytics.com https://*.googletagmanager.com https://*.firebase.com wss://*.firebaseio.com; frame-src 'self' https://*.firebaseapp.com https://*.google.com; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
}

export default nextConfig
