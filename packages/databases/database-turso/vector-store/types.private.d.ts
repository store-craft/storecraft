
export type VectorDocument = {
  id: string,
  metadata: Record<string, any>,
  embedding: number[],
  pageContent: string,
  updated_at: string,
  score?: number
  namespace?: string
}

export type VectorDocumentUpsert = Omit<VectorDocument, 'embedding' | 'metadata' | 'score'> & {
  embedding: string,
  metadata: string,
}

