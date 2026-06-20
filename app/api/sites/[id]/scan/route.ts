import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: { id: string }
}

export async function POST(_req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const siteId = params.id

  // Verify the site belongs to this user
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site introuvable.', code: 'NOT_FOUND' }, { status: 404 })
  }

  // Check if a job is already running for this site
  const { data: existing } = await supabase
    .from('scan_jobs')
    .select('id, status')
    .eq('site_id', siteId)
    .in('status', ['queued', 'running'])
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Un scan est déjà en cours pour ce site.', code: 'ALREADY_RUNNING', jobId: existing[0].id },
      { status: 409 }
    )
  }

  const { data: job, error } = await supabase
    .from('scan_jobs')
    .insert({
      site_id: siteId,
      type: 'crawl',
      status: 'queued',
      pages_limit: 50,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Impossible de créer le job de scan.', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, jobId: (job as { id: string }).id }, { status: 201 })
}
