import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ScanReport } from '@/lib/scanner/types'

interface LeadBody {
  email: string
  url: string
  score: number
  scanData: ScanReport
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { email, url, score, scanData } = body as Partial<LeadBody>

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide.', code: 'INVALID_EMAIL' }, { status: 400 })
  }
  if (typeof url !== 'string' || !url) {
    return NextResponse.json({ error: 'URL manquante.', code: 'INVALID_URL' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.from('leads').insert({
    email,
    url,
    score: typeof score === 'number' ? score : null,
    scan_data: scanData ?? null,
  })

  if (error) {
    console.error('[leads] insert error:', error.message)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement.', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
