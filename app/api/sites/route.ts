import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SiteBody {
  name: string
  url: string
}

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.', code: 'BAD_REQUEST' }, { status: 400 })
  }

  const { name, url } = body as Partial<SiteBody>

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Nom requis.', code: 'INVALID_NAME' }, { status: 400 })
  }
  if (!isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: 'URL invalide. Exemple : https://www.monsite.fr', code: 'INVALID_URL' },
      { status: 400 }
    )
  }

  const { data: site, error } = await supabase
    .from('sites')
    .insert({ name: name.trim(), url, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du site.', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: site }, { status: 201 })
}
