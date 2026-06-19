/**
 * Scan queue manager — future microservice
 * Will use a job queue (e.g. BullMQ + Redis) for concurrent scan management.
 */

export interface QueueJob {
  id: string
  projectId: string
  url: string
  status: 'pending' | 'running' | 'done' | 'failed'
  createdAt: string
}

// Placeholder — implementation requires a queue backend
export async function enqueueJob(_projectId: string, _url: string): Promise<QueueJob> {
  throw new Error('Queue not yet implemented')
}
