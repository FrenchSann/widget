/**
 * Scanner microservice — deployed separately on Railway (or any Node.js host).
 * The Next.js app on Vercel calls this service via HTTP instead of running
 * Playwright locally, which bypasses Vercel serverless bundle size limits.
 *
 * Start: npx tsx worker/server.ts
 * Health: GET /health
 * Scan:   POST /scan  { url: string }  →  { success: true, data: ScanReport }
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { scanUrl } from '../lib/scanner'

const PORT = process.env.PORT ?? 3002
const SECRET = process.env.WORKER_SECRET_KEY ?? ''

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) })
  res.end(payload)
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  // Health check (no auth required — used by Railway deploy checks)
  if (req.method === 'GET' && req.url === '/health') {
    return json(res, 200, { ok: true, service: 'accessaudit-scanner' })
  }

  // Scan endpoint
  if (req.method === 'POST' && req.url === '/scan') {
    // Verify shared secret
    if (SECRET && req.headers.authorization !== `Bearer ${SECRET}`) {
      return json(res, 401, { error: 'Unauthorized', code: 'UNAUTHORIZED' })
    }

    let url: string
    try {
      const body = await readBody(req)
      const parsed = JSON.parse(body) as { url?: unknown }
      if (typeof parsed.url !== 'string' || !parsed.url) throw new Error('missing url')
      url = parsed.url
    } catch {
      return json(res, 400, { error: 'Body must be JSON with a "url" field.', code: 'BAD_REQUEST' })
    }

    try {
      console.log(`[scanner] START  ${url}`)
      const report = await scanUrl(url)
      console.log(`[scanner] DONE   ${url} — score ${report.score}`)
      return json(res, 200, { success: true, data: report })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[scanner] ERROR  ${url} — ${message}`)
      return json(res, 500, { error: `Scan failed: ${message}`, code: 'SCAN_ERROR' })
    }
  }

  json(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`AccessAudit scanner service listening on port ${PORT}`)
})
