import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const forfait = await prisma.forfait.create({
    data: {
      categorie: body.categorie,
      nom:       body.nom,
      sousTitre: body.sous_titre ?? null,
      prix:      body.prix,
      details:   body.details ?? [],
      populaire: body.populaire ?? false,
      actif:     body.actif ?? true,
      ordre:     body.ordre ?? 0,
    },
  })

  return NextResponse.json(forfait, { status: 201 })
}
