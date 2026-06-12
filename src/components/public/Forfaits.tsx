import type { Forfait } from '@/lib/db'

type ForfaitsProps = {
  forfaits: Forfait[]
}

function CarteForfait({ forfait }: { forfait: Forfait }) {
  return (
    <div className={`relative border rounded-sm p-6 transition-colors duration-200
      ${forfait.populaire
        ? 'border-or/50 bg-or/[0.03]'
        : 'border-or/20 hover:border-or/35'}`}
    >
      {forfait.populaire && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-or text-noir text-xs tracking-widest px-3 py-0.5 rounded-b-sm">
          POPULAIRE
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs tracking-widest text-gris-chaud mb-1">{forfait.nom.toUpperCase()}</p>
          {forfait.sous_titre && (
            <p className="font-serif text-lg font-light text-creme">{forfait.sous_titre}</p>
          )}
        </div>
        <p className="font-serif text-2xl text-or font-light whitespace-nowrap ml-4">{forfait.prix}</p>
      </div>

      <ul className="border-t border-or/10 pt-3 space-y-1.5">
        {forfait.details.map((detail, i) => (
          <li key={i} className="flex gap-2 text-xs text-gris-sombre leading-relaxed">
            <span className="text-or mt-0.5 flex-shrink-0">✦</span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Forfaits({ forfaits }: ForfaitsProps) {
  const portraits = forfaits.filter((f) => f.categorie === 'portraits_evenements')
  const grands = forfaits.filter((f) => f.categorie === 'grands_forfaits')

  return (
    <section id="forfaits" className="px-8 md:px-16 py-20">
      <div className="mb-10">
        <p className="label-or mb-2">Mes prestations</p>
        <h2 className="font-serif text-3xl font-light text-creme">
          Forfaits <span className="text-or">Photo</span>
        </h2>
        <p className="text-xs text-gris-tres-sombre mt-2 leading-relaxed">
          Déplacements inclus jusqu'à 20 km · TVA non applicable, art. 293 B du CGI
        </p>
      </div>

      {/* Portraits & Événements */}
      <div className="mb-10">
        <p className="text-xs tracking-widest text-gris-chaud mb-4">PORTRAITS & ÉVÉNEMENTS</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {portraits.map((f) => <CarteForfait key={f.id} forfait={f} />)}
        </div>
      </div>

      {/* Grands Forfaits */}
      <div>
        <p className="text-xs tracking-widest text-gris-chaud mb-4">GRANDS FORFAITS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {grands.map((f) => <CarteForfait key={f.id} forfait={f} />)}
        </div>
      </div>

      <p className="text-xs text-gris-tres-sombre mt-5 leading-relaxed">
        * Hors installation du matériel · Au-delà de 20 km, frais kilométriques applicables · Options modulables sur demande
      </p>
    </section>
  )
}
