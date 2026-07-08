import type { Metadata } from 'next'
import { Cinzel, JetBrains_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-cinzel',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prodige Studio · Photographie & Vidéo',
  description: 'Photographie haut de gamme pour les professionnels, portraits, mariages et événements. Reims · France · Europe.',
  openGraph: {
    title: 'Prodige Studio',
    description: 'Photographie haut de gamme · Reims · France · Europe',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value === 'light' ? 'light' : 'dark'

  return (
    <html lang="fr" data-theme={theme}>
      <body className={`${cinzel.variable} ${jetbrainsMono.variable}`}>{children}</body>
    </html>
  )
}
