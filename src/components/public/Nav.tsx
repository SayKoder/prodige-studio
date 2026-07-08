'use client'

import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import ContactForm from './ContactForm'

const LIENS = [
  { label: 'GALERIE', href: '#galerie' },
  { label: 'SERVICES', href: '#forfaits' },
  { label: 'À PROPOS', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [contactOuvert, setContactOuvert] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 72)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!contactOuvert) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setContactOuvert(false)
    }
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setContactOuvert(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [contactOuvert])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b transition-[padding,background-color,border-color] duration-300 ${
        scrolled
          ? 'px-8 py-3 bg-noir/90 backdrop-blur-sm border-or/20'
          : 'px-8 py-5 bg-transparent border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        <a href="#hero" aria-label="Prodige Studio" className="text-creme">
          <Logo className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-10' : 'h-14'}`} />
        </a>

        {/* CTA contact rapide : apparaît à gauche une fois la nav condensée, comme au scroll sur Mango Studios */}
        {scrolled && (
          <div className="relative hidden sm:block" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setContactOuvert((v) => !v)}
              aria-expanded={contactOuvert}
              className="bg-or text-noir text-[11px] tracking-widest px-4 py-2 rounded-sm font-medium hover:bg-or-light transition-colors duration-200"
            >
              CONTACT RAPIDE
            </button>

            {contactOuvert && (
              <div className="absolute left-0 top-full mt-3 w-80 rounded-sm border border-or/25 bg-noir-2 p-5 shadow-xl">
                <p className="font-serif text-lg italic font-light text-creme mb-3">Un mot sur votre projet</p>
                <ContactForm compact onSuccess={() => setTimeout(() => setContactOuvert(false), 1800)} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8 text-xs tracking-widest text-gris-chaud">
        {LIENS.map((lien) => (
          <a
            key={lien.href}
            href={lien.href}
            className={lien.href === '#contact'
              ? 'text-or border-b border-or/40 pb-0.5 hover:border-or transition-colors duration-200'
              : 'hover:text-or transition-colors duration-200'}
          >
            {lien.label}
          </a>
        ))}
        <ThemeToggle />
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <button
          className="text-gris-chaud hover:text-or transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-noir/95 border-b border-or/20 flex flex-col gap-6 px-8 py-6">
          {LIENS.map((lien) => (
            <a
              key={lien.href}
              href={lien.href}
              className="text-xs tracking-widest text-gris-chaud hover:text-or transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {lien.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
