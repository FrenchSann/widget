'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-700 hover:text-blue-800">
            AccessAudit
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Accédez à votre tableau de bord</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4" aria-hidden="true">📧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre boîte mail</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Nous avons envoyé un lien de connexion à{' '}
                <strong className="text-gray-800">{email}</strong>.{' '}
                Cliquez sur le lien pour accéder à votre tableau de bord.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-blue-700 hover:underline text-sm focus:outline-none focus:underline"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Connexion / Inscription</h2>
              <p className="text-gray-500 text-sm mb-6">
                Entrez votre email pour recevoir un lien de connexion magique. Pas de mot de passe.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email professionnelle
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.fr"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                />
                {error && (
                  <p role="alert" className="text-red-600 text-sm mb-3">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {loading ? 'Envoi en cours…' : 'Recevoir mon lien de connexion'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          Première visite ? Votre compte est créé automatiquement.
        </p>
      </div>
    </main>
  )
}
