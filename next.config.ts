import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Las fotos de perfil (sacadas con el celular) suelen pesar varios
      // MB; el límite por defecto de Next para Server Actions es 1MB.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
