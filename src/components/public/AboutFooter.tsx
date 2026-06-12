type AboutProps = {
  textes: Record<string, string>
}

export function About({ textes }: AboutProps) {
  return (
    <section id="about" className="px-8 md:px-16 py-16">
      <div className="border border-or/15 rounded-sm p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.04), transparent)' }}>

        {/* Avatar */}
        <div className="w-16 h-16 rounded-full border border-or/30 flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2a2518, #1a1610)' }}>
          <span className="font-serif text-2xl text-or font-light">C</span>
        </div>

        {/* Phrase */}
        <div className="flex-1 text-center md:text-left">
          <p className="label-or mb-3">L'artiste derrière l'objectif</p>
          <p className="font-serif text-2xl font-light text-creme leading-snug">
            {textes.about_phrase_1 ?? "Capturer l'authentique,"}<br/>
            <span className="text-or">{textes.about_phrase_2 ?? 'sublimer l\'ordinaire.'}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 flex-shrink-0">
          <div className="text-center">
            <p className="font-serif text-3xl text-or font-light">{textes.about_annees ?? '5+'}</p>
            <p className="text-xs tracking-widest text-gris-sombre mt-1">ANS D'EXP.</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-3xl text-or font-light">{textes.about_couverture ?? 'FR·EU'}</p>
            <p className="text-xs tracking-widest text-gris-sombre mt-1">COUVERTURE</p>
          </div>
        </div>
      </div>
    </section>
  )
}

type FooterProps = {
  textes: Record<string, string>
}

export function Footer({ textes }: FooterProps) {
  return (
    <footer id="contact" className="px-8 md:px-16 pb-12">
      <div className="border border-or/20 rounded-sm p-10 text-center"
        style={{ background: 'linear-gradient(135deg, #141210, #0f0e0b)' }}>

        <p className="label-or mb-4">{textes.footer_cta_sous_titre ?? 'Envie de travailler ensemble ?'}</p>
        <h2 className="font-serif text-4xl font-light text-creme mb-6">
          {textes.footer_cta_titre ?? 'Parlons de '}
          <span className="text-or">votre projet</span>
        </h2>

        <a href="mailto:contact@prodige-studio.fr"
          className="inline-block border border-or/50 text-or text-xs tracking-widest px-9 py-3.5 rounded-sm hover:border-or hover:bg-or/5 transition-colors duration-200">
          PRENDRE RENDEZ-VOUS
        </a>

        <div className="flex justify-center gap-6 mt-8">
          {/* Instagram */}
          <a href="#" className="text-or/40 hover:text-or transition-colors duration-200" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>
          {/* LinkedIn */}
          <a href="#" className="text-or/40 hover:text-or transition-colors duration-200" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          {/* Mail */}
          <a href="mailto:contact@prodige-studio.fr" className="text-or/40 hover:text-or transition-colors duration-200" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </a>
        </div>

        <p className="text-xs text-gris-tres-sombre mt-6">© {new Date().getFullYear()} Prodige Studio — Tous droits réservés</p>
      </div>
    </footer>
  )
}
