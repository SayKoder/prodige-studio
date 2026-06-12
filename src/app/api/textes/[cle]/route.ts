import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ cle: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cle } = await params
  const { valeur } = await req.json()

  await prisma.siteTexte.update({ where: { cle }, data: { valeur } })
  return NextResponse.json({ ok: true })
}
