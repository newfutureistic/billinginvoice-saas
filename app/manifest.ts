import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

/**
 * PWA / install web manifest (Mission 4). Uses the real Bill Maker icons and brand color —
 * no new assets invented. Next serves this at /manifest.webmanifest and links it automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bill Maker — Professional Invoice Generator',
    short_name: 'Bill Maker',
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-light-32x32.png', type: 'image/png', sizes: '32x32' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
    ],
  }
}
