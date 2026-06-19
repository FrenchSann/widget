export interface Project {
  id: string
  name: string
  url: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ScanResult {
  id: string
  projectId: string
  url: string
  score: number
  violations: Violation[]
  passes: number
  warnings: number
  scannedAt: string
}

export interface Violation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: ViolationNode[]
}

export interface ViolationNode {
  html: string
  target: string[]
  failureSummary: string
}

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise'

export interface UserSubscription {
  plan: SubscriptionPlan
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | null
}
