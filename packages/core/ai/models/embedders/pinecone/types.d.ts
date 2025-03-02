export * from './index.js';

export type Multilingual_E5_Large = {
  name: 'multilingual-e5-large',
  parameters: {
    /** The type of input data. Accepted values: query or passage. */
    input_type: 'query' | 'passage',
    /** How to handle inputs longer than those supported by the model. Accepted values: END or NONE. END truncates the input sequence at the input token limit. NONE returns an error when the input exceeds the input token limit. */
    truncate: 'END' | 'NONE'
  }
}

export type Llama_Text_Embed_V2 = {
  name: 'llama-text-embed-v2',
  parameters: {
    /** The type of input data. Accepted values: query or passage. */
    input_type: 'query' | 'passage',
    /** How to handle inputs longer than those supported by the model. Accepted values: END or NONE. END truncates the input sequence at the input token limit. NONE returns an error when the input exceeds the input token limit. */
    truncate: 'END' | 'NONE',
    /** Dimension of the vector to return.	Defaults 1024 */
    dimension?:  1024 | 2048 | 768 | 512 | 384
  }
}


export type config = {
  model?: Multilingual_E5_Large | Llama_Text_Embed_V2,
  api_key: string,
}

export type RequestBody = {
  /** Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request, pass an array of strings or array of token arrays. The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002), cannot be an empty string, and any array must be 2048 dimensions or less. Example Python code for counting tokens. Some models may also impose a limit on total number of tokens summed across inputs. */
  inputs: {text: string}[],

  /** ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them. */
  model: string,

  /** Additional model-specific parameters. Refer to the model guide for available model parameters. */
  parameters: config["model"]["parameters"]
}

export type Embedding = {
  values: number[]
  vector_type: 'dense' | 'sparse'
}

export type RequestResult = {
  model: string,
  vector_type: 'dense' | 'sparse'
  data: Embedding[]
  usage: object
};
