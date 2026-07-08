import { prisma } from './db'

export type Avis = {
  auteur: string
  note: number
  texte: string
  publieLe: string
}

type ReponsePlacesApi = {
  reviews?: Array<{
    rating?: number
    text?: { text?: string }
    originalText?: { text?: string }
    authorAttribution?: { displayName?: string }
    publishTime?: string
  }>
}

/**
 * Récupère les avis Google (Places API New), avec cache ISR 24h.
 * Si les identifiants ne sont pas configurés ou que l'appel échoue,
 * on retombe sur le dernier instantané enregistré en base.
 */
export async function getAvisGoogle(): Promise<Avis[]> {
  const cle = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (cle && placeId) {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: {
          'X-Goog-Api-Key': cle,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        },
        next: { revalidate: 86400 },
      })

      if (res.ok) {
        const data: ReponsePlacesApi = await res.json()
        const avis: Avis[] = (data.reviews ?? []).map((r) => ({
          auteur: r.authorAttribution?.displayName ?? 'Client Google',
          note: r.rating ?? 5,
          texte: r.text?.text ?? r.originalText?.text ?? '',
          publieLe: r.publishTime ?? '',
        })).filter((a) => a.texte.length > 0)

        if (avis.length > 0) {
          synchroniserCache(avis).catch((err) => console.error('Cache avis Google : échec de synchronisation', err))
          return avis
        }
      } else {
        console.error('Places API New a répondu', res.status, await res.text())
      }
    } catch (err) {
      console.error('Appel Places API New impossible, repli sur le cache', err)
    }
  }

  return lireCache()
}

async function synchroniserCache(avis: Avis[]) {
  await prisma.$transaction([
    prisma.avisGoogle.deleteMany({}),
    prisma.avisGoogle.createMany({
      data: avis.map((a) => ({ auteur: a.auteur, note: a.note, texte: a.texte, publieLe: a.publieLe })),
    }),
  ])
}

async function lireCache(): Promise<Avis[]> {
  try {
    const lignes = await prisma.avisGoogle.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 })
    return lignes.map((l) => ({ auteur: l.auteur, note: l.note, texte: l.texte, publieLe: l.publieLe ?? '' }))
  } catch {
    return []
  }
}
