import { PrismaClient } from '@prisma/client'

// Singleton Prisma pour éviter trop de connexions en dev (hot-reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ─── Types exposés (compatibles avec l'UI existante) ─────────────────────────

export type Forfait = {
  id: string
  categorie: string
  nom: string
  sous_titre: string | null
  prix: string
  details: string[]
  populaire: boolean
  actif: boolean
  ordre: number
}

export type SiteTexte = {
  id: string
  cle: string
  valeur: string
  description: string | null
}

export type GaleriePhoto = {
  id: string
  titre: string
  categorie: string
  storage_path: string
  url_publique: string
  actif: boolean
  hero: boolean
  ordre: number
}

// ─── Helpers de mapping (camelCase Prisma → snake_case UI) ───────────────────

function mapForfait(f: {
  id: string; categorie: string; nom: string; sousTitre: string | null
  prix: string; details: string[]; populaire: boolean; actif: boolean; ordre: number
}): Forfait {
  return { id: f.id, categorie: f.categorie, nom: f.nom, sous_titre: f.sousTitre, prix: f.prix, details: f.details, populaire: f.populaire, actif: f.actif, ordre: f.ordre }
}

function mapSiteTexte(t: {
  id: string; cle: string; valeur: string; description: string | null
}): SiteTexte {
  return { id: t.id, cle: t.cle, valeur: t.valeur, description: t.description }
}

function mapPhoto(p: {
  id: string; titre: string; categorie: string; storagePath: string
  urlPublique: string; actif: boolean; hero: boolean; ordre: number
}): GaleriePhoto {
  return { id: p.id, titre: p.titre, categorie: p.categorie, storage_path: p.storagePath, url_publique: p.urlPublique, actif: p.actif, hero: p.hero, ordre: p.ordre }
}

// ─── Requêtes publiques ───────────────────────────────────────────────────────

export async function getForfaits(): Promise<Forfait[]> {
  const rows = await prisma.forfait.findMany({
    where: { actif: true },
    orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
  })
  return rows.map(mapForfait)
}

export async function getSiteTextes(): Promise<Record<string, string>> {
  const rows = await prisma.siteTexte.findMany()
  return Object.fromEntries(rows.map((t) => [t.cle, t.valeur]))
}

export async function getGaleriePhotos(): Promise<GaleriePhoto[]> {
  const rows = await prisma.galeriePhoto.findMany({
    where: { actif: true },
    orderBy: { ordre: 'asc' },
  })
  return rows.map(mapPhoto)
}

export async function getHeroPhotos(): Promise<GaleriePhoto[]> {
  const rows = await prisma.galeriePhoto.findMany({
    where: { actif: true, hero: true },
    orderBy: { ordre: 'asc' },
    take: 3,
  })
  return rows.map(mapPhoto)
}

// ─── Requêtes admin ───────────────────────────────────────────────────────────

export async function getAllForfaits(): Promise<Forfait[]> {
  const rows = await prisma.forfait.findMany({
    orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
  })
  return rows.map(mapForfait)
}

export async function getAllSiteTextes(): Promise<SiteTexte[]> {
  const rows = await prisma.siteTexte.findMany({ orderBy: { cle: 'asc' } })
  return rows.map(mapSiteTexte)
}

export async function getAllGaleriePhotos(): Promise<GaleriePhoto[]> {
  const rows = await prisma.galeriePhoto.findMany({ orderBy: { ordre: 'asc' } })
  return rows.map(mapPhoto)
}
