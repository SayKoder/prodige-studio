import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prodige Studio — Photographie & Vidéo',
  description: 'Photographie haut de gamme pour les professionnels, portraits, mariages et événements. Reims · France · Europe.',
  openGraph: {
    title: 'Prodige Studio',
    description: 'Photographie haut de gamme — Reims · France · Europe',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
