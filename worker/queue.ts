import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { crawlSite } from './crawler'
import { computeScore } from '../lib/scanner'

const POLL_INTERVAL_MS = 5_000

function createAdminClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Singleton — initialised lazily so missing env vars don't crash the import
let _client: SupabaseClient | null = null
function db(): SupabaseClient {
  if (!_client) _client = createAdminClient()
  return _client
}

async function claimNextJob(): Promise<Record<string, unknown> | null> {
  const { data: jobs } = await db()
    .from('scan_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at')
    .limit(1)

  if (!jobs || jobs.length === 0) return null

  const candidate = jobs[0] as { id: string; attempts: number; max_attempts: number }
  if (candidate.attempts >= candidate.max_attempts) {
    // Permanently failed — mark it so it doesn't clog the queue
    await db()
      .from('scan_jobs')
      .update({ status: 'failed', error: 'Max attempts reached', updated_at: new Date().toISOString() })
      .eq('id', candidate.id)
    return null
  }

  // Optimistic lock: only succeeds if the row is still 'queued'
  const { data: locked } = await db()
    .from('scan_jobs')
    .update({
      status: 'running',
      attempts: candidate.attempts + 1,
      locked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidate.id)
    .eq('status', 'queued')
    .select()
    .single()

  return locked ?? null
}

async function processJob(job: Record<string, unknown>): Promise<void> {
  const jobId = job.id as string
  const siteId = job.site_id as string
  const pagesLimit = (job.pages_limit as number) ?? 50

  console.log(`[queue] Processing job ${jobId} (site: ${siteId}, limit: ${pagesLimit} pages)`)

  const { data: site } = await db().from('sites').select('url').eq('id', siteId).single()

  if (!site) {
    await db()
      .from('scan_jobs')
      .update({ status: 'failed', error: 'Site not found', updated_at: new Date().toISOString() })
      .eq('id', jobId)
    return
  }

  const { data: scan } = await db()
    .from('scans')
    .insert({ site_id: siteId, status: 'running', started_at: new Date().toISOString(), pages_scanned: 0 })
    .select()
    .single()

  if (!scan) {
    await db()
      .from('scan_jobs')
      .update({ status: 'failed', error: 'Could not create scan record', updated_at: new Date().toISOString() })
      .eq('id', jobId)
    return
  }

  // Expose the scan ID so the UI can follow progress before the job is done
  await db()
    .from('scan_jobs')
    .update({ scan_id: (scan as { id: string }).id, updated_at: new Date().toISOString() })
    .eq('id', jobId)

  const scanId = (scan as { id: string }).id
  const siteUrl = (site as { url: string }).url

  try {
    const pageResults = await crawlSite(siteUrl, pagesLimit, async (done) => {
      // Real-time progress update for the UI
      await db().from('scans').update({ pages_scanned: done }).eq('id', scanId)
    })

    const successfulPages = pageResults.filter((p) => !p.error)
    const allViolations = successfulPages.flatMap((p) => p.violations)
    const score = computeScore(allViolations)

    // Insert issues in batches of 100 to avoid payload limits
    if (allViolations.length > 0) {
      const issueRows = pageResults.flatMap((pageResult) =>
        pageResult.violations.map((v) => ({
          scan_id: scanId,
          page_url: pageResult.url,
          severity: v.impact,
          wcag_rule: v.id,
          rgaa_theme: v.rgaaTheme,
          selector: v.nodes[0]?.selector ?? null,
          description: v.description,
        }))
      )
      for (let i = 0; i < issueRows.length; i += 100) {
        await db().from('issues').insert(issueRows.slice(i, i + 100))
      }
    }

    await db()
      .from('scans')
      .update({
        status: 'done',
        score,
        pages_scanned: successfulPages.length,
        finished_at: new Date().toISOString(),
      })
      .eq('id', scanId)

    await db()
      .from('scan_jobs')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .eq('id', jobId)

    console.log(
      `[queue] ✓ Job ${jobId} done — score: ${score}, pages: ${successfulPages.length}, issues: ${allViolations.length}`
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[queue] ✗ Job ${jobId} failed:`, message)

    await db()
      .from('scans')
      .update({ status: 'error', finished_at: new Date().toISOString() })
      .eq('id', scanId)

    await db()
      .from('scan_jobs')
      .update({ status: 'failed', error: message, updated_at: new Date().toISOString() })
      .eq('id', jobId)
  }
}

export async function startPollLoop(): Promise<never> {
  console.log(`[queue] Poll loop started — interval: ${POLL_INTERVAL_MS / 1000}s`)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const job = await claimNextJob()
      if (job) {
        // One job at a time — Playwright is memory-heavy
        await processJob(job)
      }
    } catch (err) {
      console.error('[queue] Unexpected poll error:', err)
    }

    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
}
