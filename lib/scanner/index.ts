import { chromium } from 'playwright'
import type { Page } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { getRgaaTheme } from './rgaa-mapping'
import type { ImpactLevel, ScanReport, ScanViolation } from './types'

export const IMPACT_PENALTIES: Record<ImpactLevel, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
}

const NAVIGATION_TIMEOUT_MS = 15_000

export function computeScore(violations: ScanViolation[]): number {
  const penalty = violations.reduce((sum, v) => {
    return sum + (IMPACT_PENALTIES[v.impact] ?? 1) * v.nodes.length
  }, 0)
  return Math.max(0, 100 - penalty)
}

// Run axe-core on an already-navigated Playwright page.
// Lets the crawler reuse one browser instance across all pages.
export async function scanPage(page: Page): Promise<ScanViolation[]> {
  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()

  return axeResults.violations.map((v) => ({
    id: v.id,
    impact: (v.impact ?? 'minor') as ImpactLevel,
    description: v.description,
    helpUrl: v.helpUrl,
    rgaaTheme: getRgaaTheme(v.id),
    nodes: v.nodes.map((n) => ({
      selector: n.target.join(', '),
      html: n.html,
    })),
  }))
}

export async function scanUrl(url: string): Promise<ScanReport> {
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(url, {
      timeout: NAVIGATION_TIMEOUT_MS,
      waitUntil: 'load',
    })
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})

    const violations = await scanPage(page)

    return {
      url,
      score: computeScore(violations),
      violations,
      scannedAt: new Date().toISOString(),
    }
  } finally {
    await browser.close()
  }
}
