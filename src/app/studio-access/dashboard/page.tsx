export const dynamic = 'force-dynamic'

import { requireAuth } from '@/lib/auth'
import DashboardClient from './DashboardClient'
import { getAllForfaits, getAllSiteTextes, getGaleriePhotos } from '@/lib/db'

export default async function Dashboard() {
  // Redirige vers /studio-access si pas connecté
  await requireAuth()

  const [forfaits, textes, photos] = await Promise.all([
    getAllForfaits(),
    getAllSiteTextes(),
    getGaleriePhotos(),
  ])

  return <DashboardClient forfaits={forfaits} textes={textes} photos={photos} />
}
