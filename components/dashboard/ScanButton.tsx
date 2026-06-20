'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ScanButtonProps {
  siteId: string
}

export default function ScanButton({ siteId }: ScanButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/sites/${siteId}/scan`, { method: 'POST' })
    const json = (await res.json()) as { jobId?: string; error?: string }

    if (!res.ok) {
      if (res.status === 409 && json.jobId) {
        // Already running — redirect to the existing job
        router.push(`/sites/${siteId}/scans/${json.jobId}`)
        return
      }
      setError(json.error ?? 'Erreur inconnue.')
      setLoading(false)
      return
    }

    router.push(`/sites/${siteId}/scans/${json.jobId}`)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full mt-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg text-xs hover:bg-blue-800 disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {loading ? 'Lancement…' : '▶ Lancer un scan'}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}
