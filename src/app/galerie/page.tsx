export const dynamic = 'force-dynamic'

import { getGaleriePhotos } from '@/lib/db'
import GalerieClient from './GalerieClient'

export default async function GaleriePage() {
  const photos = await getGaleriePhotos()
  return <GalerieClient photos={photos} />
}
