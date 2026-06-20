import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const jobId = params.id

  // RLS ensures the user can only see their own jobs (via site ownership)
  const { data: job } = await supabase
    .from('scan_jobs')
    .select('id, site_id, scan_id, status, error, pages_limit, created_at, updated_at')
    .eq('id', jobId)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Job introuvable.', code: 'NOT_FOUND' }, { status: 404 })
  }

  const jobData = job as {
    id: string
    site_id: string
    scan_id: string | null
    status: string
    error: string | null
    pages_limit: number
    created_at: string
    updated_at: string
  }

  // If a scan exists, fetch it along with issues
  let scan = null
  let issues = null

  if (jobData.scan_id) {
    const { data: scanRow } = await supabase
      .from('scans')
      .select('id, status, score, pages_scanned, started_at, finished_at')
      .eq('id', jobData.scan_id)
      .single()

    scan = scanRow

    if (jobData.status === 'done' && scanRow) {
      const { data: issueRows } = await supabase
        .from('issues')
        .select('id, page_url, severity, wcag_rule, rgaa_theme, description, selector')
        .eq('scan_id', jobData.scan_id)
        .order('severity', { ascending: true })
        .limit(500)

      issues = issueRows
    }
  }

  return NextResponse.json({ job: jobData, scan, issues })
}
