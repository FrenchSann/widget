'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const POLL_INTERVAL_MS = 3_000

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critique',
  serious: 'Sérieux',
  moderate: 'Modéré',
  minor: 'Mineur',
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  serious: 'bg-orange-100 text-orange-800 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  minor: 'bg-blue-100 text-blue-800 border-blue-200',
}

interface Issue {
  id: string
  page_url: string
  severity: string
  wcag_rule: string
  rgaa_theme: string
  description: string
  selector: string | null
}

interface ScanData {
  status: string
  score: number | null
  pages_scanned: number | null
  finished_at: string | null
}

interface JobResponse {
  job: { status: string; error: string | null; pages_limit: number; scan_id: string | null }
  scan: ScanData | null
  issues: Issue[] | null
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  return (
    <div className="text-center mb-8">
      <svg viewBox="0 0 120 120" className="w-36 h-36 mx-auto" aria-hidden="true">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${(score / 100) * 314} 314`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="68" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>
          {score}
        </text>
      </svg>
      <p className="text-gray-500 text-sm mt-1">Score d&apos;accessibilité</p>
    </div>
  )
}

export default function ScanJobPage() {
  const { id: siteId, jobId } = useParams<{ id: string; jobId: string }>()
  const [data, setData] = useState<JobResponse | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/scan-jobs/${jobId}`)
      if (!res.ok) {
        setFetchError('Impossible de charger le statut du scan.')
        return
      }
      const json = (await res.json()) as JobResponse
      setData(json)
    } catch {
      setFetchError('Erreur réseau.')
    }
  }, [jobId])

  useEffect(() => {
    poll()
  }, [poll])

  useEffect(() => {
    if (!data) return
    const status = data.job.status
    if (status === 'done' || status === 'failed') return

    const timer = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [data, poll])

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-600">{fetchError}</p>
        <Link href="/dashboard" className="text-blue-700 hover:underline text-sm">
          ← Retour au dashboard
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true">
        <div className="animate-spin h-10 w-10 border-4 border-blue-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const { job, scan, issues } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-blue-700 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            ← Dashboard
          </Link>
          <span className="font-bold text-gray-900">AccessAudit</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Statut : queued */}
        {job.status === 'queued' && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-6" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Scan en attente…</h1>
            <p className="text-gray-500 text-sm">
              Le worker va démarrer le scan dans quelques instants.
            </p>
          </div>
        )}

        {/* Statut : running */}
        {job.status === 'running' && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-6" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Scan en cours…</h1>
            <p className="text-gray-500 text-sm">
              {scan?.pages_scanned != null && scan.pages_scanned > 0
                ? `${scan.pages_scanned} page${scan.pages_scanned > 1 ? 's' : ''} analysée${scan.pages_scanned > 1 ? 's' : ''} sur ${job.pages_limit}`
                : 'Découverte des pages du site…'}
            </p>
            <p className="text-gray-400 text-xs mt-3">Mise à jour toutes les 3 secondes</p>
          </div>
        )}

        {/* Statut : failed */}
        {job.status === 'failed' && (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-4xl mb-4" aria-hidden="true">⚠️</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Le scan a échoué</h1>
            {job.error && <p className="text-red-600 text-sm mt-1">{job.error}</p>}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await fetch(`/api/sites/${siteId}/scan`, { method: 'POST' })
                window.location.reload()
              }}
              className="mt-6"
            >
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors"
              >
                Relancer le scan
              </button>
            </form>
          </div>
        )}

        {/* Statut : done */}
        {job.status === 'done' && scan && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Résultats du scan
            </h1>

            {scan.score !== null && <ScoreCircle score={scan.score} />}

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-10">
              <span className="text-gray-600">
                <strong className="text-gray-900">{scan.pages_scanned ?? 0}</strong> page
                {(scan.pages_scanned ?? 0) > 1 ? 's' : ''} analysée
                {(scan.pages_scanned ?? 0) > 1 ? 's' : ''}
              </span>
              <span className="text-gray-600">
                <strong className="text-gray-900">{issues?.length ?? 0}</strong> violation
                {(issues?.length ?? 0) !== 1 ? 's' : ''} détectée
                {(issues?.length ?? 0) !== 1 ? 's' : ''}
              </span>
              {scan.finished_at && (
                <span className="text-gray-400">
                  Terminé le{' '}
                  {new Date(scan.finished_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {!issues || issues.length === 0 ? (
              <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-5xl mb-3" aria-hidden="true">🎉</p>
                <p className="text-green-800 font-semibold text-lg">Aucune violation détectée</p>
                <p className="text-green-700 text-sm mt-1">
                  Excellent résultat sur l&apos;ensemble du site !
                </p>
              </div>
            ) : (
              <section aria-label="Violations détectées">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Violations détectées</h2>

                {/* Group by page */}
                {Array.from(new Set(issues.map((i) => i.page_url))).map((pageUrl) => {
                  const pageIssues = issues.filter((i) => i.page_url === pageUrl)
                  return (
                    <div key={pageUrl} className="mb-6">
                      <p className="text-xs text-gray-400 font-mono mb-2 truncate">{pageUrl}</p>
                      <div className="space-y-2">
                        {pageIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                          >
                            <div className="flex items-start gap-2 flex-wrap mb-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${SEVERITY_CLASS[issue.severity] ?? ''}`}
                              >
                                {SEVERITY_LABEL[issue.severity] ?? issue.severity}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {issue.rgaa_theme}
                              </span>
                              <span className="text-xs text-gray-400">{issue.wcag_rule}</span>
                            </div>
                            <p className="text-sm text-gray-800">{issue.description}</p>
                            {issue.selector && (
                              <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                                {issue.selector}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
