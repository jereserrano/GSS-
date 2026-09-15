import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* ── Modo estricto de React: detecta efectos secundarios duplicados en dev ── */
  reactStrictMode: true,

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

export default nextConfig;
