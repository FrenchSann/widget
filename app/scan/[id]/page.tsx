'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ScoreGauge from '@/components/ui/ScoreGauge'
import type { ScanReport, ScanViolation } from '@/lib/scanner/types'

const IMPACT_LABEL: Record<string, string> = {
  critical: 'Critique',
  serious: 'Sérieux',
  moderate: 'Modéré',
  minor: 'Mineur',
}

const IMPACT_CLASS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  serious: 'bg-orange-100 text-orange-800 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  minor: 'bg-blue-100 text-blue-800 border-blue-200',
}

const VIOLATION_SORT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
}

function ViolationCard({ violation }: { violation: ScanViolation }) {
  return (
    <article className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${IMPACT_CLASS[violation.impact] ?? ''}`}
          >
            {IMPACT_LABEL[violation.impact] ?? violation.impact}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {violation.rgaaTheme}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {violation.nodes.length} élément{violation.nodes.length > 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-sm text-gray-800 mb-1">{violation.description}</p>
      <a
        href={violation.helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline focus:underline focus:outline-none"
      >
        Guide de correction →
      </a>
    </article>
  )
}

function EmailGate({
  remaining,
  onUnlock,
}: {
  remaining: number
  onUnlock: () => void
}) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: send email to Resend when configured
    setSubmitted(true)
    setTimeout(onUnlock, 800)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm mx-auto text-center">
      {submitted ? (
        <p className="text-green-700 font-semibold">Merci ! Accès au rapport complet en cours…</p>
      ) : (
        <>
          <p className="text-gray-800 font-semibold mb-1">
            +{remaining} violation{remaining > 1 ? 's' : ''} masquée{remaining > 1 ? 's' : ''}
          </p>
          <p className="text-gray-500 text-sm mb-5">
            Entrez votre email pour accéder au rapport complet gratuitement.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email-gate" className="sr-only">
              Votre adresse email
            </label>
            <input
              id="email-gate"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.fr"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Voir le rapport complet
            </button>
          </form>
          <p className="mt-3 text-xs text-gray-400">Sans spam. Désabonnement en un clic.</p>
        </>
      )}
    </div>
  )
}

function formatUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url)
    return pathname === '/' ? hostname : `${hostname}${pathname}`
  } catch {
    return url
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ScanResultPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<ScanReport | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [emailUnlocked, setEmailUnlocked] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(`scan_${id}`)
    if (!stored) {
      setNotFound(true)
      return
    }
    try {
      setReport(JSON.parse(stored) as ScanReport)
    } catch {
      setNotFound(true)
    }
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-500 text-lg">Session expirée ou résultat introuvable.</p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Lancer une nouvelle analyse
        </Link>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true" aria-label="Chargement des résultats">
        <div className="animate-spin h-10 w-10 border-4 border-blue-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const sorted = [...report.violations].sort(
    (a, b) => (VIOLATION_SORT_ORDER[a.impact] ?? 4) - (VIOLATION_SORT_ORDER[b.impact] ?? 4)
  )
  const topFive = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const hasMore = rest.length > 0
  const criticalCount = report.violations.filter((v) => v.impact === 'critical').length
  const seriousCount = report.violations.filter((v) => v.impact === 'serious').length

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-700 hover:text-blue-800 text-sm font-medium flex items-center gap-1 focus:underline focus:outline-none"
          >
            ← Nouvelle analyse
          </Link>
          <span className="text-gray-900 font-bold">AccessAudit</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Score section */}
        <section className="text-center mb-10" aria-label="Résultat du scan">
          <ScoreGauge score={report.score} />
          <p className="mt-4 text-gray-500 text-sm">
            <strong className="text-gray-800 font-medium">{formatUrl(report.url)}</strong>
            <span className="mx-2" aria-hidden="true">·</span>
            Analysé le {formatDate(report.scannedAt)}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-900">{report.violations.length}</strong> violation
              {report.violations.length !== 1 ? 's' : ''} détectée
              {report.violations.length !== 1 ? 's' : ''}
            </span>
            {criticalCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {seriousCount > 0 && (
              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded-full font-medium">
                {seriousCount} sérieux
              </span>
            )}
          </div>
        </section>

        {/* Violations */}
        {report.violations.length === 0 ? (
          <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
            <p className="text-4xl mb-3" aria-hidden="true">🎉</p>
            <p className="text-green-800 font-semibold text-lg">Aucune violation détectée</p>
            <p className="text-green-700 text-sm mt-1">
              Excellent résultat ! Continuez les audits réguliers pour maintenir ce niveau.
            </p>
          </div>
        ) : (
          <section aria-label="Violations détectées">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {topFive.length === sorted.length
                ? 'Violations détectées'
                : `Top ${topFive.length} violations les plus graves`}
            </h2>

            <div className="space-y-3">
              {topFive.map((v) => (
                <ViolationCard key={v.id} violation={v} />
              ))}
            </div>

            {/* Blurred rest with email gate */}
            {hasMore && (
              <div className="relative mt-3">
                <div
                  className={`space-y-3 ${!emailUnlocked ? 'blur-sm pointer-events-none select-none' : ''}`}
                  aria-hidden={!emailUnlocked}
                >
                  {rest.map((v) => (
                    <ViolationCard key={v.id} violation={v} />
                  ))}
                </div>
                {!emailUnlocked && (
                  <div className="absolute inset-0 flex items-start justify-center pt-10 bg-white/60 backdrop-blur-sm rounded-xl">
                    <EmailGate remaining={rest.length} onUnlock={() => setEmailUnlocked(true)} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Disclaimer */}
        <aside
          className="mt-12 p-5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500"
          aria-label="Avertissement sur les limites de l'audit automatisé"
        >
          <strong className="text-gray-700">Limites de l&apos;audit automatisé : </strong>
          Cet outil détecte automatiquement environ 30 à 40&nbsp;% des critères RGAA. Les résultats
          sont indicatifs et ne constituent pas un audit de conformité légale. Pour une conformité
          certifiée EAA/RGAA, un audit manuel par un expert est indispensable.
        </aside>
      </main>
    </>
  )
}
