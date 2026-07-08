import type { Avis as AvisType } from '@/lib/avis'
import CornerFrame from './CornerFrame'

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex gap-1 text-or" aria-label={`${note} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < note ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7-5.4-4.7 7.1-.6z" />
        </svg>
      ))}
    </div>
  )
}

function formaterDate(iso: string) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(iso))
  } catch {
    return ''
  }
}

type AvisProps = {
  avis: AvisType[]
  textes: Record<string, string>
}

export default function Avis({ avis, textes }: AvisProps) {
  if (avis.length === 0) return null

  return (
    <section id="avis" className="px-8 md:px-16 py-20">
      <div className="mb-10">
        <p className="label-or mb-2">{textes.avis_sous_titre ?? 'Avis Google'}</p>
        <h2 className="font-serif text-3xl font-light text-creme">
          {textes.avis_titre ?? "Ce qu'ils en disent"}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {avis.map((a, i) => (
          <CornerFrame key={i} className="rounded-sm border border-or/15 bg-noir-3 p-6">
            <Etoiles note={a.note} />
            <p className="mt-3 font-serif text-lg italic font-light text-creme leading-snug">
              "{a.texte}"
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-gris-chaud">
              {a.auteur} · Google{formaterDate(a.publieLe) ? ` · ${formaterDate(a.publieLe)}` : ''}
            </p>
          </CornerFrame>
        ))}
      </div>
    </section>
  )
}
