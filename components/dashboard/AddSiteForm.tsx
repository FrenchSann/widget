'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddSiteForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    })

    const json = (await res.json()) as { error?: string; data?: { id: string } }

    if (!res.ok) {
      setError(json.error ?? 'Erreur inconnue.')
      setLoading(false)
      return
    }

    setName('')
    setUrl('')
    setOpen(false)
    setLoading(false)
    onSuccess?.()
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        + Ajouter un site
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ajouter un site</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du site
            </label>
            <input
              id="site-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon entreprise"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="site-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL du site
            </label>
            <input
              id="site-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.monentreprise.fr"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null) }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium focus:outline-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {loading ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
