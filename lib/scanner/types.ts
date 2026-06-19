export type ImpactLevel = 'minor' | 'moderate' | 'serious' | 'critical'

export interface ScanNode {
  selector: string
  html: string
}

export interface ScanViolation {
  id: string
  impact: ImpactLevel
  description: string
  helpUrl: string
  rgaaTheme: string
  nodes: ScanNode[]
}

export interface ScanReport {
  url: string
  score: number
  violations: ScanViolation[]
  scannedAt: string
}
