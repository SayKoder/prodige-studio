'use client'
import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-or/20 bg-noir/90 backdrop-blur-sm">
      <a href="#hero">
        <img src="/logo.svg" alt="Prodige Studio" className="h-10 w-auto" />
      </a>

      {/* Desktop */}
      <div className="hidden md:flex gap-8 text-xs tracking-widest text-gris-chaud">
        <a href="#galerie" className="hover:text-or transition-colors duration-200">GALERIE</a>
        <a href="#forfaits" className="hover:text-or transition-colors duration-200">SERVICES</a>
        <a href="#about" className="hover:text-or transition-colors duration-200">À PROPOS</a>
        <a href="#contact" className="text-or border-b border-or/40 pb-0.5 hover:border-or transition-colors duration-200">CONTACT</a>
      </div>

      {/* Mobile burger */}
      <button
        className="md:hidden text-gris-chaud hover:text-or transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {menuOpen ? (
            <>
              <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5"/>
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5"/>
            </>
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-noir/95 border-b border-or/20 flex flex-col gap-6 px-8 py-6">
          {['GALERIE', 'SERVICES', 'À PROPOS', 'CONTACT'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace('à propos', 'about').replace('services', 'forfaits')}`}
              className="text-xs tracking-widest text-gris-chaud hover:text-or transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
