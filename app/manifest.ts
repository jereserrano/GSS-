import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GSS Media Técnica',
    short_name: 'GSS',
    description: 'Sistema de Información para el Seguimiento del Proceso de Integración con la Media Técnica',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#39A900',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
