
export type RequestBody = {
  /** Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request, pass an array of strings or array of token arrays. The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002), cannot be an empty string, and any array must be 2048 dimensions or less. Example Python code for counting tokens. Some models may also impose a limit on total number of tokens summed across inputs. */
  input: string | string[],

  /** ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them. */
  model: string,

  /** The format to return the embeddings in. Can be either float or base64. */
  encoding_format?: 'float' | 'base64';

  /** The number of dimensions the resulting output embeddings should have. Only supported in text-embedding-3 and later models. */
  dimensions?: number;

  /** A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. Learn more. */
  user?: string;
}

export type Embedding = {
  /** The index of the embedding in the list of embeddings. */
  index: number;

  /** The embedding vector, which is a list of floats. The length of vector depends on the model as listed in the embedding guide. */
  embedding: number[],

  object: 'embedding'
}

export type RequestResult = {
  object: 'list',
  data: Embedding[],
  model: string,
  usage: object
};

export type RequestErrorResult = {
  error: {
    code: number,
    message: string,
    type: string
  }
};
