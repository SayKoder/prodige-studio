import Image from 'next/image'
import type { GaleriePhoto } from '@/lib/db'

const CATEGORIES = ['corporate', 'mariage', 'nature', 'portrait', 'evenement'] as const

type GalerieProps = {
  photos: GaleriePhoto[]
}

export default function Galerie({ photos }: GalerieProps) {
  const photosByCategorie = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = photos.filter((p) => p.categorie === cat)
    return acc
  }, {} as Record<string, GaleriePhoto[]>)

  // Grille : grand à gauche (première photo dispo), petites à droite
  const photosPrincipales = photos.slice(0, 5)

  return (
    <section id="galerie" className="px-8 md:px-16 py-20">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="label-or mb-2">Portfolio sélectionné</p>
          <h2 className="font-serif text-3xl font-light text-creme">Galerie</h2>
        </div>
        <span className="text-xs tracking-widest text-or border-b border-or/30 pb-0.5 cursor-pointer hover:border-or transition-colors">
          TOUT VOIR →
        </span>
      </div>

      {photos.length === 0 ? (
        // Placeholders si pas encore de photos uploadées
        <div className="grid gap-1.5" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 150px' }}>
          {[
            { label: 'CORPORATE', span: true },
            { label: 'MARIAGE', span: false },
            { label: 'NATURE', span: false },
            { label: 'PORTRAIT', span: false },
            { label: 'ÉVÉNEMENT', span: false },
          ].map(({ label, span }) => (
            <div
              key={label}
              className={`relative border border-or/10 rounded-sm flex items-end p-3 ${span ? 'row-span-2' : ''}`}
              style={{ background: 'linear-gradient(135deg, #1a1813, #242018)' }}
            >
              <span className="text-xs tracking-widest text-or/40">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        // Vraies photos
        <div className="grid gap-1.5" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 150px' }}>
          {photosPrincipales.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative border border-or/10 rounded-sm overflow-hidden group ${i === 0 ? 'row-span-2' : ''}`}
            >
              <Image
                src={photo.url_publique}
                alt={photo.titre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes={i === 0 ? '40vw' : '20vw'}
              />
              <div className="absolute inset-0 bg-noir/20 group-hover:bg-noir/10 transition-colors duration-300" />
              <span className="absolute bottom-3 left-3 text-xs tracking-widest text-creme/60">
                {photo.categorie.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
