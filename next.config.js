/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'fthzoepekxipizxebefk.supabase.co',
            port: '',
            pathname: '/storage/v1/object/public/cover_photos/**',
          },
        ],
      },
};

module.exports = nextConfig;
