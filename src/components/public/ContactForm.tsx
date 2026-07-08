'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { contactSchema, PRESTATIONS } from '@/lib/validation/contact'

type Statut = 'idle' | 'chargement' | 'succes' | 'erreur'

const LABELS_PRESTATION: Record<(typeof PRESTATIONS)[number], string> = {
  portrait: 'Portrait',
  mariage: 'Mariage',
  corporate: 'Corporate',
  animalier: 'Animalier',
  evenement: 'Événement privé',
  autre: 'Autre',
}

type ContactFormProps = {
  compact?: boolean
  onSuccess?: () => void
}

export default function ContactForm({ compact = false, onSuccess }: ContactFormProps) {
  const [statut, setStatut] = useState<Statut>('idle')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurGlobale, setErreurGlobale] = useState('')

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErreurs({})
    setErreurGlobale('')

    const donnees = new FormData(e.currentTarget)
    const valeurs = {
      nom: String(donnees.get('nom') ?? ''),
      email: String(donnees.get('email') ?? ''),
      telephone: String(donnees.get('telephone') ?? ''),
      prestation: String(donnees.get('prestation') ?? ''),
      message: String(donnees.get('message') ?? ''),
    }

    const analyse = contactSchema.safeParse(valeurs)
    if (!analyse.success) {
      const champs: Record<string, string> = {}
      for (const pb of analyse.error.issues) {
        const cle = String(pb.path[0])
        if (!champs[cle]) champs[cle] = pb.message
      }
      setErreurs(champs)
      return
    }

    setStatut('chargement')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...analyse.data, site_web: donnees.get('site_web') ?? '' }),
      })

      if (res.status === 429) {
        setErreurGlobale('Trop de tentatives depuis cette connexion. Réessayez dans un moment.')
        setStatut('erreur')
        return
      }

      if (!res.ok) {
        setErreurGlobale("L'envoi a échoué. Réessayez ou contactez-nous directement par e-mail.")
        setStatut('erreur')
        return
      }

      setStatut('succes')
      onSuccess?.()
    } catch {
      setErreurGlobale('Connexion impossible. Vérifiez votre réseau et réessayez.')
      setStatut('erreur')
    }
  }

  if (statut === 'succes') {
    return (
      <div className="rounded-sm border border-or/30 bg-or/[0.04] p-6 text-center">
        <p className="font-serif text-xl font-light text-creme">Message envoyé.</p>
        <p className="mt-2 text-sm text-gris-sombre">Nous revenons vers vous sous 48h.</p>
      </div>
    )
  }

  return (
    <form onSubmit={envoyer} noValidate className="flex flex-col gap-4">
      {/* Honeypot : un humain ne remplit jamais ce champ */}
      <div className="champ-piege" aria-hidden="true">
        <label htmlFor="site_web">Laissez ce champ vide</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <Champ id="nom" label="Nom" erreur={erreurs.nom}>
          <input id="nom" name="nom" type="text" autoComplete="name" className={champClass} />
        </Champ>
        <Champ id="email" label="E-mail" erreur={erreurs.email}>
          <input id="email" name="email" type="email" autoComplete="email" className={champClass} />
        </Champ>
      </div>

      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <Champ id="telephone" label="Téléphone (optionnel)" erreur={erreurs.telephone}>
          <input id="telephone" name="telephone" type="tel" autoComplete="tel" className={champClass} />
        </Champ>
        <Champ id="prestation" label="Prestation" erreur={erreurs.prestation}>
          <select id="prestation" name="prestation" className={champClass} defaultValue="">
            <option value="">Non précisé</option>
            {PRESTATIONS.map((p) => (
              <option key={p} value={p}>{LABELS_PRESTATION[p]}</option>
            ))}
          </select>
        </Champ>
      </div>

      <Champ id="message" label="Message" erreur={erreurs.message}>
        <textarea id="message" name="message" rows={compact ? 3 : 5} className={champClass} />
      </Champ>

      {erreurGlobale && (
        <p role="alert" className="text-xs text-red-400/90">{erreurGlobale}</p>
      )}

      <button
        type="submit"
        disabled={statut === 'chargement'}
        className="self-start bg-or text-noir text-xs tracking-widest px-6 py-3 rounded-sm font-medium hover:bg-or-light transition-colors duration-200 disabled:opacity-60"
      >
        {statut === 'chargement' ? 'ENVOI EN COURS...' : 'ENVOYER'}
      </button>
    </form>
  )
}

const champClass = 'w-full rounded-sm border border-or/20 bg-noir-2 px-3 py-2 text-sm text-creme placeholder:text-gris-tres-sombre focus:border-or focus:outline-none'

function Champ({ id, label, erreur, children }: { id: string; label: string; erreur?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-widest text-gris-chaud">
        {label}
      </label>
      {children}
      {erreur && <p className="text-xs text-red-400/90">{erreur}</p>}
    </div>
  )
}
