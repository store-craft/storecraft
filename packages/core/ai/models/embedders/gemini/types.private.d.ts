export type RequestBody = {
  requests: {
    content: {
      parts: {
        text: string
      }[]
    }

    /** ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them. */
    model: string,

    taskType?: 'TASK_TYPE_UNSPECIFIED',
  }[]
}

export type Embedding = {
  /** The index of the embedding in the list of embeddings. */
  index: number;

  /** The embedding vector, which is a list of floats. The length of vector depends on the model as listed in the embedding guide. */
  embedding: number[],

  object: 'embedding'
}

export type RequestResult = {
  embeddings: {
    values: number[]
  }[]
};
