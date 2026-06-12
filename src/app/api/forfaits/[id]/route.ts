import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const forfait = await prisma.forfait.update({
    where: { id },
    data: {
      nom:       body.nom,
      sousTitre: body.sous_titre ?? null,
      prix:      body.prix,
      details:   body.details,
      populaire: body.populaire,
      actif:     body.actif,
    },
  })

  return NextResponse.json(forfait)
}
