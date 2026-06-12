'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Forfait, SiteTexte, GaleriePhoto } from '@/lib/db'

type Tab = 'forfaits' | 'textes' | 'galerie'

type Props = {
  forfaits: Forfait[]
  textes:   SiteTexte[]
  photos:   GaleriePhoto[]
}

export default function DashboardClient({ forfaits: initialForfaits, textes: initialTextes, photos: initialPhotos }: Props) {
  const [tab,     setTab]     = useState<Tab>('forfaits')
  const [forfaits, setForfaits] = useState(initialForfaits)
  const [textes,   setTextes]   = useState(initialTextes)
  const [photos,   setPhotos]   = useState(initialPhotos)
  const [saving,   setSaving]   = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [uploadCategorie, setUploadCategorie] = useState('portrait')
  const router = useRouter()

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/studio-access' })
  }

  // ─── FORFAITS ─────────────────────────────────────────────────────────────

  async function saveForfait(f: Forfait) {
    setSaving(f.id)
    const res = await fetch(`/api/forfaits/${f.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom:       f.nom,
        sous_titre: f.sous_titre,
        prix:      f.prix,
        details:   f.details,
        populaire: f.populaire,
        actif:     f.actif,
      }),
    })
    setSaving(null)
    if (res.ok) showSuccess('Forfait sauvegardé')
    router.refresh()
  }

  function updateForfaitField(id: string, field: keyof Forfait, value: unknown) {
    setForfaits(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  function updateDetail(forfaitId: string, index: number, value: string) {
    setForfaits(prev => prev.map(f => {
      if (f.id !== forfaitId) return f
      const details = [...f.details]
      details[index] = value
      return { ...f, details }
    }))
  }

  // ─── TEXTES ───────────────────────────────────────────────────────────────

  async function saveTexte(cle: string, valeur: string) {
    setSaving(cle)
    await fetch(`/api/textes/${encodeURIComponent(cle)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valeur }),
    })
    setSaving(null)
    showSuccess('Texte sauvegardé')
    router.refresh()
  }

  function updateTexte(id: string, valeur: string) {
    setTextes(prev => prev.map(t => t.id === id ? { ...t, valeur } : t))
  }

  // ─── GALERIE ──────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving('upload')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('categorie', uploadCategorie)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload échoué')

      const photo = await res.json() as GaleriePhoto
      setPhotos(prev => [...prev, photo])
      showSuccess('Photo uploadée')
      router.refresh()
    } catch (err) {
      console.error(err)
    }
    setSaving(null)
  }

  async function handleDeletePhoto(photo: GaleriePhoto) {
    if (!confirm('Supprimer cette photo ?')) return
    const res = await fetch(`/api/galerie/${photo.id}`, { method: 'DELETE' })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      showSuccess('Photo supprimée')
    }
  }

  async function handleUpdateCategorie(photo: GaleriePhoto, categorie: string) {
    const res = await fetch(`/api/galerie/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorie }),
    })
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, categorie } : p))
      showSuccess('Catégorie mise à jour')
    }
  }

  async function handleToggleHero(photo: GaleriePhoto) {
    const heroCount = photos.filter(p => p.hero).length
    if (!photo.hero && heroCount >= 3) {
      showSuccess('Maximum 3 photos en hero — désélectionnes-en une d\'abord')
      return
    }
    const res = await fetch(`/api/galerie/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hero: !photo.hero }),
    })
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, hero: !p.hero } : p))
      showSuccess(photo.hero ? 'Retirée du hero' : 'Ajoutée au hero !')
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'forfaits', label: 'Forfaits & Prix'   },
    { key: 'textes',   label: 'Textes du site'    },
    { key: 'galerie',  label: 'Galerie photos'    },
  ]

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <div className="border-b border-or/20 px-8 py-4 flex items-center justify-between">
        <div>
          <span className="font-serif text-lg font-light text-creme">PRODIGE</span>
          <span className="font-serif text-lg font-semibold text-or"> STUDIO</span>
          <span className="ml-3 label-or text-xs">DASHBOARD</span>
        </div>
        <div className="flex items-center gap-4">
          {success && <span className="text-xs text-green-400 tracking-wide">{success}</span>}
          <a href="/" target="_blank" className="text-xs text-gris-chaud hover:text-or transition-colors">
            Voir le site →
          </a>
          <button onClick={handleLogout} className="text-xs text-gris-sombre hover:text-or transition-colors">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-or/10 px-8 flex gap-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`py-3.5 text-xs tracking-widest transition-colors border-b-2 -mb-px
              ${tab === t.key ? 'text-or border-or' : 'text-gris-chaud border-transparent hover:text-creme'}`}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="px-8 py-8 max-w-4xl">

        {/* ——— FORFAITS ——— */}
        {tab === 'forfaits' && (
          <div className="space-y-6">
            <p className="label-or">Modifier les forfaits, prix et détails</p>

            {['portraits_evenements', 'grands_forfaits'].map(cat => (
              <div key={cat}>
                <p className="text-xs tracking-widest text-gris-chaud mb-3 mt-6">
                  {cat === 'portraits_evenements' ? 'PORTRAITS & ÉVÉNEMENTS' : 'GRANDS FORFAITS'}
                </p>
                {forfaits.filter(f => f.categorie === cat).map(f => (
                  <div key={f.id} className="border border-or/15 rounded-sm p-5 mb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gris-chaud block mb-1">Nom</label>
                        <input value={f.nom} onChange={e => updateForfaitField(f.id, 'nom', e.target.value)}
                          className="w-full bg-transparent border border-or/20 rounded-sm px-3 py-2 text-sm text-creme focus:border-or/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gris-chaud block mb-1">Sous-titre</label>
                        <input value={f.sous_titre ?? ''} onChange={e => updateForfaitField(f.id, 'sous_titre', e.target.value)}
                          className="w-full bg-transparent border border-or/20 rounded-sm px-3 py-2 text-sm text-creme focus:border-or/50 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gris-chaud block mb-1">Prix</label>
                        <input value={f.prix} onChange={e => updateForfaitField(f.id, 'prix', e.target.value)}
                          className="w-full bg-transparent border border-or/20 rounded-sm px-3 py-2 text-sm text-or font-serif focus:border-or/50 focus:outline-none" />
                      </div>
                      <div className="flex items-end gap-4 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={f.populaire} onChange={e => updateForfaitField(f.id, 'populaire', e.target.checked)}
                            className="accent-or" />
                          <span className="text-xs text-gris-chaud">Populaire</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={f.actif} onChange={e => updateForfaitField(f.id, 'actif', e.target.checked)}
                            className="accent-or" />
                          <span className="text-xs text-gris-chaud">Actif</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gris-chaud block mb-1">Détails (un par ligne)</label>
                      {f.details.map((d, i) => (
                        <input key={i} value={d} onChange={e => updateDetail(f.id, i, e.target.value)}
                          className="w-full bg-transparent border border-or/15 rounded-sm px-3 py-1.5 text-xs text-gris-sombre focus:border-or/40 focus:outline-none mb-1.5" />
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => saveForfait(f)} disabled={saving === f.id}
                        className="bg-or text-noir text-xs tracking-widest px-5 py-2 rounded-sm font-medium hover:bg-or-light disabled:opacity-50 transition-colors">
                        {saving === f.id ? 'SAUVEGARDE...' : 'SAUVEGARDER'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ——— TEXTES ——— */}
        {tab === 'textes' && (
          <div className="space-y-4">
            <p className="label-or mb-4">Modifier les textes du portfolio</p>
            {textes.map(t => (
              <div key={t.id} className="border border-or/15 rounded-sm p-4">
                <label className="text-xs text-gris-chaud block mb-1">
                  {t.description ?? t.cle}
                </label>
                <div className="flex gap-2">
                  <textarea value={t.valeur} onChange={e => updateTexte(t.id, e.target.value)} rows={2}
                    className="flex-1 bg-transparent border border-or/20 rounded-sm px-3 py-2 text-sm text-creme focus:border-or/50 focus:outline-none resize-none" />
                  <button onClick={() => saveTexte(t.cle, t.valeur)} disabled={saving === t.cle}
                    className="bg-or text-noir text-xs tracking-widest px-4 rounded-sm font-medium hover:bg-or-light disabled:opacity-50 transition-colors self-stretch">
                    {saving === t.cle ? '...' : 'OK'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ——— GALERIE ——— */}
        {tab === 'galerie' && (
          <div>
            <p className="label-or mb-4">Gérer les photos de la galerie</p>

            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-gris-chaud">Catégorie :</label>
              <select value={uploadCategorie} onChange={e => setUploadCategorie(e.target.value)}
                className="bg-transparent border border-or/20 rounded-sm px-3 py-1.5 text-sm text-creme focus:border-or/50 focus:outline-none">
                <option value="portrait">Portrait</option>
                <option value="mariage">Mariage</option>
                <option value="evenement">Événement</option>
                <option value="pro">Pro / Corporate</option>
              </select>
            </div>

            <label className="block border-2 border-dashed border-or/20 rounded-sm p-8 text-center cursor-pointer hover:border-or/40 transition-colors mb-6">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={saving === 'upload'} />
              <p className="text-sm text-gris-chaud">
                {saving === 'upload' ? 'Upload en cours...' : 'Cliquer pour uploader une photo'}
              </p>
              <p className="text-xs text-gris-tres-sombre mt-1">JPG, PNG, WebP — optimisé automatiquement</p>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative border border-or/10 rounded-sm overflow-hidden aspect-square group">
                  <img src={photo.url_publique} alt={photo.titre} className="w-full h-full object-cover" />
                  {photo.hero && (
                    <div className="absolute top-2 right-2 bg-or text-noir text-xs px-1.5 py-0.5 rounded-sm font-medium">
                      HERO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-noir/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <select value={photo.categorie}
                      onChange={e => handleUpdateCategorie(photo, e.target.value)}
                      className="bg-noir border border-or/40 rounded-sm px-2 py-1 text-xs text-creme w-full focus:outline-none">
                      <option value="portrait">Portrait</option>
                      <option value="mariage">Mariage</option>
                      <option value="evenement">Événement</option>
                      <option value="pro">Pro / Corporate</option>
                    </select>
                    <button onClick={() => handleToggleHero(photo)}
                      className={`text-xs px-2 py-1 rounded-sm w-full border transition-colors ${
                        photo.hero
                          ? 'text-or border-or/60 hover:bg-or/10'
                          : 'text-gris-chaud border-or/20 hover:border-or/50 hover:text-or'
                      }`}>
                      {photo.hero ? '★ Retirer du hero' : '☆ Mettre en hero'}
                    </button>
                    <button onClick={() => handleDeletePhoto(photo)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-400/50 px-2 py-1 rounded-sm w-full">
                      Supprimer
                    </button>
                  </div>
                  <p className="absolute bottom-2 left-2 text-xs text-creme/60 truncate max-w-full px-1">{photo.titre}</p>
                </div>
              ))}

              {photos.length === 0 && (
                <p className="col-span-3 text-sm text-gris-tres-sombre text-center py-8">
                  Aucune photo uploadée pour l'instant
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
