'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function StudioAccess() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError('Identifiants incorrects.')
      setLoading(false)
      return
    }

    router.push('/studio-access/dashboard')
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-serif text-xl font-light tracking-widest text-creme">
            PRODIGE<span className="text-or font-semibold"> STUDIO</span>
          </p>
          <p className="label-or mt-2">ACCÈS ADMINISTRATION</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest text-gris-chaud mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-or/20 rounded-sm px-4 py-3 text-sm text-creme placeholder-gris-tres-sombre focus:border-or/60 focus:outline-none transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest text-gris-chaud mb-2">MOT DE PASSE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-or/20 rounded-sm px-4 py-3 text-sm text-creme placeholder-gris-tres-sombre focus:border-or/60 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-or text-noir text-xs tracking-widest py-3.5 rounded-sm font-medium hover:bg-or-light disabled:opacity-50 transition-colors duration-200 mt-2"
          >
            {loading ? 'CONNEXION...' : 'ACCÉDER'}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-gris-tres-sombre">
          <a href="/" className="hover:text-gris-chaud transition-colors">← Retour au portfolio</a>
        </p>
      </div>
    </div>
  )
}
