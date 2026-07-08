'use client'
import { useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Forfait, SiteTexte, GaleriePhoto } from '@/lib/db'

type Tab = 'forfaits' | 'textes' | 'galerie'

type RatioCadrage = 'portrait' | 'paysage'
const RATIOS: Record<RatioCadrage, number> = { portrait: 3 / 4, paysage: 4 / 3 }

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

  async function handleCreateForfait(categorie: string) {
    setSaving('new')
    const res = await fetch('/api/forfaits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categorie,
        nom:      'Nouveau forfait',
        prix:     'Sur devis',
        details:  ['Détail 1', 'Détail 2'],
        actif:    true,
        populaire: false,
      }),
    })
    setSaving(null)
    if (res.ok) {
      const created = await res.json()
      setForfaits(prev => [...prev, {
        id:        created.id,
        categorie: created.categorie,
        nom:       created.nom,
        sous_titre: created.sousTitre ?? null,
        prix:      created.prix,
        details:   created.details,
        populaire: created.populaire,
        actif:     created.actif,
        ordre:     created.ordre,
      }])
      showSuccess('Forfait créé')
    }
  }

  async function handleDeleteForfait(f: Forfait) {
    if (!confirm(`Supprimer "${f.nom}" ?`)) return
    const res = await fetch(`/api/forfaits/${f.id}`, { method: 'DELETE' })
    if (res.ok) {
      setForfaits(prev => prev.filter(x => x.id !== f.id))
      showSuccess('Forfait supprimé')
    }
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
      showSuccess("Maximum 3 photos en hero, désélectionnez-en une d'abord")
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

  const [cropping, setCropping] = useState<GaleriePhoto | null>(null)
  const [ratioCadrage, setRatioCadrage] = useState<RatioCadrage>('portrait')
  const [draftFocal, setDraftFocal] = useState({ x: 50, y: 50 })

  function openCropModal(photo: GaleriePhoto) {
    setDraftFocal({ x: photo.focal_x, y: photo.focal_y })
    setCropping(photo)
  }

  async function handleSaveFocal(photo: GaleriePhoto, focalX: number, focalY: number) {
    const res = await fetch(`/api/galerie/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focalX, focalY }),
    })
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, focal_x: focalX, focal_y: focalY } : p))
      showSuccess('Cadrage enregistré')
      setCropping(null)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'forfaits', label: 'Forfaits & Prix'   },
    { key: 'textes',   label: 'Textes du site'    },
    { key: 'galerie',  label: 'Galerie photos'    },
  ]

  return (
    <div data-theme="dark" className="min-h-screen bg-noir">
      {/* Header : back-office volontairement toujours sombre, outil de travail et non vitrine */}
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

        {/* === FORFAITS === */}
        {tab === 'forfaits' && (
          <div className="space-y-6">
            <p className="label-or">Modifier les forfaits, prix et détails</p>

            {['portraits_evenements', 'grands_forfaits'].map(cat => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3 mt-6">
                  <p className="text-xs tracking-widest text-gris-chaud">
                    {cat === 'portraits_evenements' ? 'PORTRAITS & ÉVÉNEMENTS' : 'GRANDS FORFAITS'}
                  </p>
                  <button onClick={() => handleCreateForfait(cat)} disabled={saving === 'new'}
                    className="text-xs text-or border border-or/30 px-3 py-1 rounded-sm hover:border-or hover:bg-or/5 transition-colors disabled:opacity-50">
                    + Ajouter un forfait
                  </button>
                </div>
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
                    <div className="flex justify-between">
                      <button onClick={() => handleDeleteForfait(f)}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-4 py-2 rounded-sm transition-colors">
                        Supprimer
                      </button>
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

        {/* === TEXTES === */}
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

        {/* === GALERIE === */}
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
              <p className="text-xs text-gris-tres-sombre mt-1">JPG, PNG, WebP : optimisé automatiquement</p>
            </label>

            <p className="text-xs text-gris-tres-sombre mb-3">
              Survolez une photo pour la modifier. « Recadrer » ouvre un aperçu aux proportions réelles du site.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative border border-or/10 rounded-sm overflow-hidden aspect-square group">
                  <img
                    src={photo.url_publique}
                    alt={photo.titre}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `${photo.focal_x}% ${photo.focal_y}%` }}
                  />
                  {photo.hero && (
                    <div className="absolute top-2 right-2 bg-or text-noir text-xs px-1.5 py-0.5 rounded-sm font-medium">
                      HERO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-noir/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button onClick={() => openCropModal(photo)}
                      className="text-xs text-or border border-or/50 px-2 py-1 rounded-sm w-full hover:bg-or/10 transition-colors">
                      ⤢ Recadrer
                    </button>
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
                  <p className="absolute bottom-2 left-2 text-xs text-creme/60 truncate max-w-full px-1 pointer-events-none">{photo.titre}</p>
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

      {cropping && (
        <div className="fixed inset-0 z-50 bg-noir/90 flex items-center justify-center p-6" onClick={() => setCropping(null)}>
          <div className="bg-noir border border-or/20 rounded-sm p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-creme truncate pr-4">Cadrage · {cropping.titre}</p>
              <button onClick={() => setCropping(null)} className="text-gris-chaud hover:text-creme text-lg leading-none flex-shrink-0">✕</button>
            </div>

            <div className="flex gap-2 mb-4">
              {(['portrait', 'paysage'] as RatioCadrage[]).map(r => (
                <button key={r} onClick={() => setRatioCadrage(r)}
                  className={`text-xs tracking-widest px-3 py-1.5 rounded-sm border transition-colors ${
                    ratioCadrage === r
                      ? 'text-or border-or/60 bg-or/10'
                      : 'text-gris-chaud border-or/20 hover:border-or/40'
                  }`}>
                  {r === 'portrait' ? 'PORTRAIT · HAUT DE PAGE' : 'PAYSAGE · GALERIE'}
                </button>
              ))}
            </div>

            <CropStage key={cropping.id} photo={cropping} ratio={RATIOS[ratioCadrage]} focal={draftFocal} onChange={setDraftFocal} />

            <p className="text-xs text-gris-tres-sombre mt-3">
              Faites glisser directement sur la photo pour choisir la zone à toujours garder visible.
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setCropping(null)} className="text-xs text-gris-chaud px-4 py-2 hover:text-creme transition-colors">
                Annuler
              </button>
              <button onClick={() => handleSaveFocal(cropping, draftFocal.x, draftFocal.y)}
                className="bg-or text-noir text-xs tracking-widest px-5 py-2 rounded-sm font-medium hover:bg-or-light transition-colors">
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type CropStageProps = {
  photo: GaleriePhoto
  ratio: number
  focal: { x: number; y: number }
  onChange: (focal: { x: number; y: number }) => void
}

function CropStage({ photo, ratio, focal, onChange }: CropStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)

  function mesurer() {
    const rect = stageRef.current?.getBoundingClientRect()
    if (rect) setStageSize({ width: rect.width, height: rect.height })
  }

  function positionDepuisPointeur(clientX: number, clientY: number) {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
    const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)))
    onChange({ x, y })
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    positionDepuisPointeur(e.clientX, e.clientY)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return
    positionDepuisPointeur(e.clientX, e.clientY)
  }

  const winWidth = stageSize.width && stageSize.height
    ? Math.min(stageSize.width, stageSize.height * ratio) * 0.65
    : 0
  const winHeight = winWidth / ratio

  const winLeft = Math.min(Math.max((focal.x / 100) * stageSize.width - winWidth / 2, 0), stageSize.width - winWidth)
  const winTop  = Math.min(Math.max((focal.y / 100) * stageSize.height - winHeight / 2, 0), stageSize.height - winHeight)

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragging(false)}
      style={{ width: 'fit-content' }}
      className="relative mx-auto select-none cursor-crosshair rounded-sm overflow-hidden border border-or/15 touch-none">
      <img
        src={photo.url_publique}
        alt={photo.titre}
        onLoad={mesurer}
        className="max-w-full max-h-[55vh] w-auto h-auto block pointer-events-none"
        draggable={false}
      />
      {stageSize.width > 0 && (
        <div
          className="absolute border-2 border-or pointer-events-none"
          style={{ width: winWidth, height: winHeight, left: winLeft, top: winTop, boxShadow: '0 0 0 9999px rgba(10, 9, 8, 0.65)' }}
        />
      )}
      <div
        className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-or border-2 border-noir pointer-events-none"
        style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
      />
    </div>
  )
}
