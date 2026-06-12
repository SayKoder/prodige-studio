import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { removeFile } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { categorie?: string; titre?: string; actif?: boolean }

  const photo = await prisma.galeriePhoto.update({
    where: { id },
    data: {
      ...(body.categorie !== undefined && { categorie: body.categorie }),
      ...(body.titre     !== undefined && { titre:     body.titre     }),
      ...(body.actif     !== undefined && { actif:     body.actif     }),
    },
  })

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const photo = await prisma.galeriePhoto.findUnique({ where: { id } })
  if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await removeFile(photo.storagePath)
  await prisma.galeriePhoto.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
