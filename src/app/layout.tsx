import type { Metadata } from 'next'
import { Cinzel } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-cinzel',
  display: 'swap',
})

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
      <body className={cinzel.variable}>{children}</body>
    </html>
  )
}
