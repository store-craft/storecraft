export * from './index.js';

export type Multilingual_E5_Large = {
  name: 'multilingual-e5-large',
  parameters?: {
    /** The type of input data. Accepted values: query or passage. */
    input_type?: 'query' | 'passage',
    /** How to handle inputs longer than those supported by the model. Accepted values: END or NONE. END truncates the input sequence at the input token limit. NONE returns an error when the input exceeds the input token limit. */
    truncate?: 'END' | 'NONE'
  }
}

export type Llama_Text_Embed_V2 = {
  name: 'llama-text-embed-v2',
  parameters?: {
    /** The type of input data. Accepted values: query or passage. */
    input_type?: 'query' | 'passage',
    /** How to handle inputs longer than those supported by the model. Accepted values: END or NONE. END truncates the input sequence at the input token limit. NONE returns an error when the input exceeds the input token limit. */
    truncate?: 'END' | 'NONE',
    /** Dimension of the vector to return.	Defaults 1024 */
    dimension?:  1024 | 2048 | 768 | 512 | 384
  }
}


export type config = {
  model?: Multilingual_E5_Large | Llama_Text_Embed_V2,

  /** If absent, will be infered from environment variable `PINECONE_API_KEY` */
  api_key?: string,
}
