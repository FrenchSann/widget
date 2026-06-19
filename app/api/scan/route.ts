import { NextRequest, NextResponse } from 'next/server'
import { scanUrl } from '@/lib/scanner'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const SCAN_TIMEOUT_MS = 20_000

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const lastScanAt = req.cookies.get('last_scan')?.value
  if (lastScanAt) {
    const elapsed = Date.now() - Number(lastScanAt)
    if (elapsed < RATE_LIMIT_WINDOW_MS) {
      const waitSecs = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000)
      return NextResponse.json(
        {
          error: `Patientez encore ${waitSecs} seconde${waitSecs > 1 ? 's' : ''} avant de relancer un scan.`,
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      )
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const url = (body as Record<string, unknown>).url
  if (!isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: "URL invalide. Exemple valide : https://www.monsite.fr", code: 'INVALID_URL' },
      { status: 400 }
    )
  }

  try {
    const result = await Promise.race([
      scanUrl(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), SCAN_TIMEOUT_MS)
      ),
    ])

    const response = NextResponse.json({ success: true, data: result })
    response.cookies.set('last_scan', String(Date.now()), {
      httpOnly: true,
      maxAge: 60,
      path: '/',
      sameSite: 'lax',
    })
    return response
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return NextResponse.json(
        {
          error:
            'Le scan a pris plus de 20 secondes. Le site est peut-être trop lent ou inaccessible depuis nos serveurs.',
          code: 'TIMEOUT',
        },
        { status: 504 }
      )
    }
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json(
      {
        error: `Le scan a échoué : ${message}. Vérifiez que l'URL est accessible publiquement.`,
        code: 'SCAN_ERROR',
      },
      { status: 500 }
    )
  }
}
