/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If your backend is on a different port during development and you need to proxy, configure rewrites here.
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Proxy API requests
        destination: 'http://localhost:5000/:path*', // Your backend URL
      },
      // {
      //   source: '/ws/:path*', // Proxy WebSocket requests
      //   destination: 'ws://localhost:5000/:path*',
      // }
    ];
  },
};

export default nextConfig;