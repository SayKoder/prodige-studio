'use client'

import { useEffect, useState } from 'react'
import Signature from './Signature'

const UN_AN = 60 * 60 * 24 * 365

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const actuel = document.documentElement.getAttribute('data-theme')
    setTheme(actuel === 'light' ? 'light' : 'dark')
  }, [])

  function basculer() {
    const suivant = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', suivant)
    document.cookie = `theme=${suivant}; path=/; max-age=${UN_AN}; SameSite=Lax`
    setTheme(suivant)
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
      title="Diaphragme"
      className={`group flex h-8 w-8 items-center justify-center rounded-full border border-or/20 text-or/70 transition-colors duration-200 hover:border-or hover:text-or ${className}`}
    >
      <Signature className="h-4 w-4 transition-transform duration-500 ease-out group-hover:rotate-45" />
    </button>
  )
}
