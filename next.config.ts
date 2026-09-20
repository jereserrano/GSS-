import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* ── Modo estricto de React: detecta efectos secundarios duplicados en dev ── */
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  /* ── Configuración de Server Actions para permitir acceso desde LAN ── */
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '192.168.40.6:3000',
        '0.0.0.0:3000',
        '127.0.0.1:3000',
      ],
    },
  },

  /* ── Permitir acceso desde la red local en modo desarrollo ── */
  allowedDevOrigins: ['192.168.40.6', 'localhost', '127.0.0.1', '0.0.0.0'],

  /* ── Imágenes externas permitidas (logos institucionales) ── */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.sena.edu.co", /* CDN oficial del SENA */
      },
    ],
  },

  /* ── Headers de seguridad HTTP ── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },              /* Previene clickjacking */
          { key: "X-Content-Type-Options", value: "nosniff" },    /* Previene MIME sniffing */
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
