
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


export type create_vector_index_params = {
  /** Drop the table and index before creating it, this is good for reset */
  dropTableAndIndexIfExists?: boolean
}