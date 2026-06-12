import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { saveFile } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file      = formData.get('file') as File | null
  const categorie = (formData.get('categorie') as string) || 'portrait'

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })

  const { storagePath, urlPublique } = await saveFile(file, categorie)

  const count = await prisma.galeriePhoto.count()
  const photo = await prisma.galeriePhoto.create({
    data: {
      titre:       file.name.replace(/\.[^.]+$/, ''),
      categorie,
      storagePath,
      urlPublique,
      actif:       true,
      ordre:       count,
    },
  })

  return NextResponse.json({
    id:           photo.id,
    titre:        photo.titre,
    categorie:    photo.categorie,
    storage_path: photo.storagePath,
    url_publique: photo.urlPublique,
    actif:        photo.actif,
    ordre:        photo.ordre,
  })
}
