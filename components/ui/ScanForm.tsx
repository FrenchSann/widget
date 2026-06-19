'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScanReport } from '@/lib/scanner/types'

export default function ScanForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Une erreur est survenue. Réessayez.')
        return
      }

      const id = crypto.randomUUID()
      sessionStorage.setItem(`scan_${id}`, JSON.stringify(json.data as ScanReport))
      router.push(`/scan/${id}`)
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} aria-label="Scanner un site web">
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="url-input" className="sr-only">
            URL du site à analyser
          </label>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.monentreprise.fr"
            required
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-base outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-800 disabled:opacity-60"
            aria-describedby={error ? 'scan-error' : undefined}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-blue-800"
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Scan en cours…
              </span>
            ) : (
              'Scanner gratuitement'
            )}
          </button>
        </div>
      </form>
      {error && (
        <p id="scan-error" role="alert" className="mt-3 text-red-300 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
