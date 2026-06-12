import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { removeFile } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

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
