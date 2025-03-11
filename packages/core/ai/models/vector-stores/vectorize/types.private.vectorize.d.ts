
export type vectorize_vector = {
  id: string,
  values: number[],
  metadata: any
}

export type cf_response_wrapper<T extends any = undefined> = {
  success: boolean,
  errors?: { code: number, message: string }[];
  messages?: { code: number, message: string }[];
  result?: T
}

export type create_vector_index_params = {
  config: {
    dimensions: number,
    metric: 'cosine' | 'euclidean' | 'dot-product',
  },
  name: string,
  description?: string
}

export type create_vector_index_result = {
  config?: create_vector_index_params["config"]
  created_on?: string
  modified_on?: string
  description: string,
  name?: string
}

export type query_vectors_params = {
  /** The search vector that will be used to find the nearest neighbors. */
  vector: number[]

  /** A metadata filter expression used to limit nearest neighbor results. */
  filter?: unknown

  /** Whether to return no metadata, indexed metadata or all metadata associated with the closest vectors. */
  returnMetadata?: "none" | "indexed" | "all"

  /** Whether to return the values associated with the closest vectors. */
  returnValues?: boolean

  /** The number of nearest neighbors to find. */
  topK?: number
}

export type query_vectors_result = {
  count: number,
  matches: (Partial<vectorize_vector> & {
    score: number
  })[],
}