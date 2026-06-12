import Image from 'next/image'
import type { GaleriePhoto } from '@/lib/db'

type HeroProps = {
  textes: Record<string, string>
  heroPhotos: GaleriePhoto[]
}

export default function Hero({ textes, heroPhotos }: HeroProps) {
  const [main, second, third] = heroPhotos

  return (
    <section id="hero" className="grid grid-cols-1 md:grid-cols-2 min-h-screen pt-16"
      style={{ background: 'linear-gradient(160deg, #0f0e0b 0%, #1a1610 60%, #0a0a08 100%)' }}>

      {/* Texte */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-20">
        <p className="label-or mb-5">{textes.hero_localisation ?? 'Reims · France · Europe'}</p>

        <h1 className="font-serif font-light leading-tight text-creme" style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>
          {textes.hero_titre_1 ?? "L'image au"}
          <br />
          <span className="text-or font-semibold">{textes.hero_titre_2 ?? 'service'}</span>
          <br />
          {textes.hero_titre_3 ?? 'de votre récit'}
        </h1>

        <p className="mt-5 text-sm text-gris-sombre leading-relaxed max-w-sm">
          {textes.hero_sous_titre ?? 'Photographie haut de gamme pour les professionnels, portraits, mariages et événements qui comptent.'}
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#galerie"
            className="bg-or text-noir text-xs tracking-widest px-6 py-3 rounded-sm font-medium hover:bg-or-light transition-colors duration-200">
            VOIR MON TRAVAIL
          </a>
          <a href="#contact"
            className="border border-or/40 text-or text-xs tracking-widest px-6 py-3 rounded-sm hover:border-or hover:bg-or/5 transition-colors duration-200">
            PRENDRE CONTACT
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="flex items-center gap-3 mt-12">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-or/50" />
          <span className="text-xs tracking-widest text-or/40">SCROLL</span>
        </div>
      </div>

      {/* Visuels */}
      <div className="hidden md:flex items-center justify-center gap-4 px-8 py-20">
        {/* Grande photo à gauche */}
        <div className="w-44 h-64 rounded-sm border border-or/25 overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e1b14, #2a2518)' }}>
          {main ? (
            <div className="relative w-full h-full group">
              <Image
                src={main.url_publique}
                alt={main.titre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="176px"
                priority
              />
              <div className="absolute inset-0 bg-noir/10 group-hover:bg-noir/0 transition-colors duration-300" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.35">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-xs tracking-widest text-or/30">PHOTO</span>
            </div>
          )}
        </div>

        {/* Deux petites photos à droite */}
        <div className="flex flex-col gap-4">
          <div className="w-32 h-36 rounded-sm border border-or/15 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #181613, #201d15)' }}>
            {second ? (
              <div className="relative w-full h-full group">
                <Image
                  src={second.url_publique}
                  alt={second.titre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-noir/10 group-hover:bg-noir/0 transition-colors duration-300" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.25">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="text-xs tracking-widest text-or/25">PORTRAIT</span>
              </div>
            )}
          </div>

          <div className="w-32 h-24 rounded-sm border border-or/10 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #141310, #1e1b13)' }}>
            {third ? (
              <div className="relative w-full h-full group">
                <Image
                  src={third.url_publique}
                  alt={third.titre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-noir/10 group-hover:bg-noir/0 transition-colors duration-300" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="text-xs tracking-widest text-or/20">MARIAGE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
