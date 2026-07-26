/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Some hosts report a very high logical CPU count on a resource-constrained/shared
  // instance (observed: 47 static-generation workers), which raced badly enough to hand a
  // worker a corrupted React module — every hook call failed with "Cannot read properties
  // of null (reading 'useState')", on a different page each build. Capping this to 1 makes
  // static generation single-threaded and fully deterministic; the build is a bit slower,
  // but it can no longer race.
  experimental: {
    cpus: 1,
  },
  // Convenience aliases → the real auth routes (so /login, /signup, etc. don't 404).
  async redirects() {
    return [
      { source: '/login', destination: '/auth/sign-in', permanent: false },
      { source: '/signin', destination: '/auth/sign-in', permanent: false },
      { source: '/sign-in', destination: '/auth/sign-in', permanent: false },
      { source: '/log-in', destination: '/auth/sign-in', permanent: false },
      { source: '/signup', destination: '/auth/sign-up', permanent: false },
      { source: '/sign-up', destination: '/auth/sign-up', permanent: false },
      { source: '/register', destination: '/auth/sign-up', permanent: false },
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: false },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: false },
      { source: '/verify-email', destination: '/auth/verify-email', permanent: false },
    ]
  },
}

export default nextConfig
