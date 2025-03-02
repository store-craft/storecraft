
export type VectorDocument = {
  id: string,
  metadata: Record<string, any>,
  embedding: number[],
  pageContent: string,
  updated_at: string
}