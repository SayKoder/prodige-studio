import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSchema } from '@/lib/validation/contact'
import { domainePeutRecevoirDuCourrier } from '@/lib/validation/emailDomaine'
import { envoyerEmailsContact } from '@/lib/email'

const LIMITE_PAR_HEURE = 5
const FENETRE_MS = 60 * 60 * 1000

function adresseIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'inconnue'
}

export async function POST(req: NextRequest) {
  let corps: Record<string, unknown>
  try {
    corps = await req.json()
  } catch {
    return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 })
  }

  // Honeypot : un bot qui remplit ce champ reçoit un faux succès, sans effet réel.
  if (typeof corps.site_web === 'string' && corps.site_web.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const analyse = contactSchema.safeParse(corps)
  if (!analyse.success) {
    return NextResponse.json({ erreur: 'Champs invalides.', details: analyse.error.flatten() }, { status: 400 })
  }

  const ip = adresseIp(req)
  const depuis = new Date(Date.now() - FENETRE_MS)
  const recentes = await prisma.demandeContact.count({ where: { ip, createdAt: { gte: depuis } } })
  if (recentes >= LIMITE_PAR_HEURE) {
    return NextResponse.json({ erreur: 'Trop de tentatives, réessayez plus tard.' }, { status: 429 })
  }

  const donnees = analyse.data

  const domaineValide = await domainePeutRecevoirDuCourrier(donnees.email)
  if (!domaineValide) {
    return NextResponse.json(
      { erreur: 'Champs invalides.', details: { fieldErrors: { email: ['Ce domaine ne semble pas pouvoir recevoir de courrier.'] } } },
      { status: 400 },
    )
  }

  await prisma.demandeContact.create({
    data: {
      nom: donnees.nom,
      email: donnees.email,
      telephone: donnees.telephone || null,
      prestation: donnees.prestation || null,
      message: donnees.message,
      ip,
    },
  })

  try {
    await envoyerEmailsContact(donnees)
  } catch (err) {
    // La demande est déjà enregistrée en base : on ne bloque pas l'utilisateur
    // pour un incident d'envoi d'e-mail, mais on le journalise côté serveur.
    console.error('Échec envoi e-mail de contact', err)
  }

  return NextResponse.json({ ok: true })
}
