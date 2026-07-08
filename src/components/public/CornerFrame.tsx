import type { ReactNode } from 'react'

type CornerFrameProps = {
  children: ReactNode
  className?: string
  /** Affiche les repères en permanence plutôt qu'au survol. */
  visible?: boolean
}

/**
 * Repères de cadre façon marques de registre argentique : deux coins en L
 * qui apparaissent au survol. C'est l'élément signature réutilisé sur les
 * photos, les avis et les forfaits mis en avant.
 */
export default function CornerFrame({ children, className = '', visible = false }: CornerFrameProps) {
  const show = visible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'

  return (
    <div className={`group relative ${className}`}>
      {children}
      <span className={`pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l border-t border-or transition-opacity duration-200 ${show}`} />
      <span className={`pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b border-r border-or transition-opacity duration-200 ${show}`} />
    </div>
  )
}
