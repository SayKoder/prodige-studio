'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { GaleriePhoto } from '@/lib/db'

const CATS = [
  { key: 'tous',       label: 'Tous'         },
  { key: 'portrait',   label: 'Portrait'     },
  { key: 'mariage',    label: 'Mariage'      },
  { key: 'evenement',  label: 'Événement'    },
  { key: 'pro',        label: 'Pro / Corporate' },
]

export default function GalerieClient({ photos }: { photos: GaleriePhoto[] }) {
  const [filtre, setFiltre] = useState('tous')
  const [selected, setSelected] = useState<GaleriePhoto | null>(null)

  const visible = filtre === 'tous' ? photos : photos.filter(p => p.categorie === filtre)

  return (
    <main className="min-h-screen bg-noir px-8 md:px-16 py-20">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <Link href="/" className="text-xs tracking-widest text-gris-chaud hover:text-or transition-colors mb-4 inline-block">
            ← RETOUR
          </Link>
          <p className="label-or mb-2">Portfolio complet</p>
          <h1 className="font-serif text-4xl font-light text-creme">Galerie</h1>
        </div>
        <p className="text-xs text-gris-chaud">{visible.length} photo{visible.length > 1 ? 's' : ''}</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-10 border-b border-or/10 pb-4">
        {CATS.map(c => (
          <button key={c.key} onClick={() => setFiltre(c.key)}
            className={`text-xs tracking-widest transition-colors pb-1 border-b-2 -mb-px
              ${filtre === c.key ? 'text-or border-or' : 'text-gris-chaud border-transparent hover:text-creme'}`}>
            {c.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grille */}
      {visible.length === 0 ? (
        <p className="text-sm text-gris-tres-sombre text-center py-20">
          Aucune photo dans cette catégorie
        </p>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
          {visible.map(photo => (
            <div key={photo.id}
              className="break-inside-avoid relative overflow-hidden rounded-sm border border-or/10 group cursor-pointer"
              onClick={() => setSelected(photo)}>
              <Image
                src={photo.url_publique}
                alt={photo.titre}
                width={600}
                height={400}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/30 transition-colors duration-300" />
              <span className="absolute bottom-3 left-3 text-xs tracking-widest text-creme/0 group-hover:text-creme/70 transition-colors duration-300">
                {photo.categorie.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-noir/95 z-50 flex items-center justify-center p-8"
          onClick={() => setSelected(null)}>
          <button className="absolute top-6 right-8 text-gris-chaud hover:text-creme text-2xl" onClick={() => setSelected(null)}>
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
            <Image
              src={selected.url_publique}
              alt={selected.titre}
              width={1200}
              height={800}
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <p className="text-center text-xs tracking-widest text-gris-chaud mt-4">
              {selected.titre} · {selected.categorie.toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
