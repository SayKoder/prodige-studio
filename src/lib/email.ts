import { Resend } from 'resend'
import type { ContactInput } from './validation/contact'

const LABELS_PRESTATION: Record<string, string> = {
  portrait: 'Portrait',
  mariage: 'Mariage',
  corporate: 'Corporate',
  animalier: 'Animalier',
  evenement: 'Événement privé',
  autre: 'Autre',
}

/**
 * Envoie la notification interne et l'e-mail de confirmation client.
 * Si RESEND_API_KEY n'est pas configurée, la fonction se contente de
 * journaliser un avertissement : la demande reste enregistrée en base.
 */
export async function envoyerEmailsContact(donnees: ContactInput) {
  const cle = process.env.RESEND_API_KEY
  if (!cle) {
    console.warn('RESEND_API_KEY absente : e-mail de contact non envoyé (voir .env.local.example).')
    return
  }

  const resend = new Resend(cle)
  const expediteur = process.env.CONTACT_EMAIL_FROM || 'Prodige Studio <onboarding@resend.dev>'
  const destinataire = process.env.CONTACT_EMAIL_TO || 'carl.heintz02@gmail.com'
  const prestation = donnees.prestation ? LABELS_PRESTATION[donnees.prestation] ?? donnees.prestation : 'Non précisée'

  await resend.emails.send({
    from: expediteur,
    to: destinataire,
    replyTo: donnees.email,
    subject: `Nouvelle demande · ${donnees.nom}`,
    html: gabaritInterne({ ...donnees, prestation }),
  })

  await resend.emails.send({
    from: expediteur,
    to: donnees.email,
    subject: 'Votre message a bien été reçu · Prodige Studio',
    html: gabaritConfirmation(donnees.nom),
  })
}

function gabaritInterne(d: Omit<ContactInput, 'prestation'> & { prestation: string }) {
  return `
    <div style="font-family: Georgia, serif; background: #0a0908; color: #f2ece1; padding: 32px;">
      <h1 style="color: #c7a052; font-size: 20px; font-weight: 600;">Nouvelle demande de contact</h1>
      <table style="margin-top: 16px; font-size: 14px; line-height: 1.6;">
        <tr><td style="color: #948c7a; padding-right: 12px;">Nom</td><td>${escapeHtml(d.nom)}</td></tr>
        <tr><td style="color: #948c7a; padding-right: 12px;">E-mail</td><td>${escapeHtml(d.email)}</td></tr>
        <tr><td style="color: #948c7a; padding-right: 12px;">Téléphone</td><td>${escapeHtml(d.telephone || 'Non précisé')}</td></tr>
        <tr><td style="color: #948c7a; padding-right: 12px;">Prestation</td><td>${escapeHtml(d.prestation)}</td></tr>
      </table>
      <p style="margin-top: 20px; white-space: pre-wrap; font-size: 14px;">${escapeHtml(d.message)}</p>
    </div>
  `
}

function gabaritConfirmation(nom: string) {
  return `
    <div style="font-family: Georgia, serif; background: #0a0908; color: #f2ece1; padding: 32px; text-align: center;">
      <h1 style="color: #c7a052; font-size: 22px; font-weight: 600; font-style: italic;">Merci, ${escapeHtml(nom)}.</h1>
      <p style="margin-top: 16px; font-size: 14px; color: #f2ece1;">
        Votre message a bien été reçu. Nous revenons vers vous sous 48h avec nos disponibilités.
      </p>
      <p style="margin-top: 24px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #948c7a;">
        Prodige Studio · Reims · France
      </p>
    </div>
  `
}

function escapeHtml(valeur: string) {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
