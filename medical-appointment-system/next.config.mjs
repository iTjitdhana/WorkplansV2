/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.94:3007',
  },
  allowedDevOrigins: [
    'http://localhost:5000',
    'http://192.168.0.94:5000',
    'http://192.168.0.161:5000'
  ]
}

export default nextConfig
