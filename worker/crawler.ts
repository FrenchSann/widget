import { chromium } from 'playwright'
import { scanPage } from '../lib/scanner'
import type { ScanViolation } from '../lib/scanner/types'

export interface PageResult {
  url: string
  violations: ScanViolation[]
  error?: string
}

const SKIP_EXTENSIONS = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico',
  'xml', 'json', 'css', 'js', 'zip', 'tar', 'gz', 'mp4', 'mp3', 'woff', 'woff2',
])

function normalizeUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base)
    url.hash = ''
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    const ext = url.pathname.split('.').pop()?.toLowerCase()
    if (ext && SKIP_EXTENSIONS.has(ext)) return null
    return url.href
  } catch {
    return null
  }
}

function isSameOrigin(url: string, base: string): boolean {
  try {
    return new URL(url).hostname === new URL(base).hostname
  } catch {
    return false
  }
}

export async function crawlSite(
  startUrl: string,
  limit: number,
  onProgress?: (done: number, current: string) => void
): Promise<PageResult[]> {
  const seed = normalizeUrl(startUrl, startUrl) ?? startUrl
  const visited = new Set<string>()
  const queue: string[] = [seed]
  const results: PageResult[] = []

  const browser = await chromium.launch({ headless: true })
  try {
    while (queue.length > 0 && results.length < limit) {
      const url = queue.shift()!
      if (visited.has(url)) continue
      visited.add(url)

      const page = await browser.newPage()
      try {
        await page.goto(url, { timeout: 20_000, waitUntil: 'load' })
        await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {})

        // Collect internal links for BFS
        const hrefs: string[] = await page
          .$$eval('a[href]', (els) => els.map((el) => (el as HTMLAnchorElement).href))
          .catch(() => [])

        for (const href of hrefs) {
          const norm = normalizeUrl(href, url)
          if (norm && isSameOrigin(norm, seed) && !visited.has(norm) && !queue.includes(norm)) {
            queue.push(norm)
          }
        }

        const violations = await scanPage(page)
        results.push({ url, violations })
        onProgress?.(results.length, url)

        console.log(`[crawler] ✓ (${results.length}/${limit}) ${url} — ${violations.length} violations`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.warn(`[crawler] ✗ ${url} — ${message}`)
        results.push({ url, violations: [], error: message })
        onProgress?.(results.length, url)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }

  return results
}
