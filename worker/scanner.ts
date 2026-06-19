/**
 * Scanner worker — future microservice
 * Runs Playwright + axe-core to audit a URL for RGAA/EAA compliance.
 * This module will be extracted to a standalone Node.js service.
 */

export interface ScanOptions {
  url: string
  timeout?: number
  rules?: string[]
}

export interface ScanReport {
  url: string
  score: number
  violations: unknown[]
  passes: number
  warnings: number
  scannedAt: string
}

// Placeholder — implementation requires playwright + axe-core packages
export async function scanUrl(_options: ScanOptions): Promise<ScanReport> {
  throw new Error('Scanner not yet implemented — install playwright and axe-core first')
}
