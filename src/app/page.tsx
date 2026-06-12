import Nav from '@/components/public/Nav'
import Hero from '@/components/public/Hero'
import Galerie from '@/components/public/Galerie'
import Forfaits from '@/components/public/Forfaits'
import { About, Footer } from '@/components/public/AboutFooter'
import { getForfaits, getSiteTextes, getGaleriePhotos } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [forfaits, textes, photos] = await Promise.all([
    getForfaits(),
    getSiteTextes(),
    getGaleriePhotos(),
  ])

  return (
    <main className="min-h-screen bg-noir">
      <Nav />
      <Hero textes={textes} />
      <Galerie photos={photos} />
      <Forfaits forfaits={forfaits} />
      <About textes={textes} />
      <Footer textes={textes} />
    </main>
  )
}
