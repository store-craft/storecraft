export * from './index.js';

export type config = {
  model?: ('voyage-3-large' | 'voyage-3' | 'voyage-3-lite' | 'voyage-code-3' | 'voyage-finance-2' | 'voyage-law-2') | ({} & string),
  endpoint?: string,
  api_version?: string;

  /** If absent, will be infered from environment variable `VOYAGE_AI_API_KEY` */
  api_key?: string
}

export type RequestBody = {
  /**
   * A single text string, or a list of texts as a list of strings, such as ["I like cats", "I also like dogs"]. Currently, we have two constraints on the list:
   * The maximum length of the list is 128. The total number of tokens in the list is at most 1M for voyage-3-lite; 320K for voyage-3 and voyage-2; and 120K for voyage-3-large, voyage-code-3, voyage-large-2-instruct, voyage-finance-2, voyage-multilingual-2, voyage-law-2, and voyage-large-2.
   */
  input: string | string[],

  /** Name of the model. Recommended options: voyage-3-large, voyage-3, voyage-3-lite, voyage-code-3, voyage-finance-2, voyage-law-2 */
  model: string,

  /** Type of the input text. Defaults to null. Other options: query, document.
   * 
   * When input_type is `null`, the embedding model directly converts the inputs (texts) into numerical vectors. 
   * For retrieval/search purposes, where a "query" is used to search for relevant information among a collection of 
   * data referred to as "documents," we recommend specifying whether your inputs (texts) are intended as queries or 
   * documents by setting input_type to query or document, respectively. 
   * 
   * In these cases, Voyage automatically prepends a prompt to your inputs before vectorizing them, creating vectors 
   * more tailored for retrieval/search tasks. Embeddings generated with and without the input_type argument are compatible.
   * 
   * For transparency, the following prompts are prepended to your input. 
   * For query, the prompt is "Represent the query for retrieving supporting documents: ". 
   * For document, the prompt is "Represent the document for retrieval: ". 
   */
  input_type?: null | 'query' | 'document'

  /** Whether to truncate the input texts to fit within the context length. Defaults to true.
   * - If true, an over-length input texts will be truncated to fit within the context length, before vectorized by the embedding model.
   * - If false, an error will be raised if any given text exceeds the context length 
   */
  truncation?: boolean

  /** 
   * The number of dimensions for resulting output embeddings. Defaults to null. 
   * Most models only support a single default dimension, used when output_dimension is set to `null` 
   * (see output embedding dimensions here). 
   * 
   * voyage-3-large and voyage-code-3 support the following output_dimension values: 2048, 1024 (default), 512, and 256. 
   */
  output_dimension?: null | number

  output_dtype?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary'

  /**
   * Format in which the embeddings are encoded. Defaults to null. Other options: base64.
   * 
   * - If null, each embedding is an array of float numbers when output_dtype is set to float and as an array of integers for all other values of output_dtype (int8, uint8, binary, and ubinary).
   * - If base64, the embeddings are represented as a Base64-encoded NumPy array of: 
   *   - Floating-point numbers (numpy.float32) for output_dtype set to float.
   *   - Signed integers (numpy.int8) for output_dtype set to int8 or binary. 
   *   - Unsigned integers (numpy.uint8) for output_dtype set to uint8 or ubinary.
   */
  encoding_format?: null | 'base64'
}

export type Embedding = {
  /** The index of the embedding in the list of embeddings. */
  index: number;

  /** Each embedding is a vector represented as an array of float numbers when output_dtype is set to float and as an array of integers for all other values of output_dtype (int8, uint8, binary, and ubinary). The length of this vector varies depending on the specific model, output_dimension, and output_dtype */
  embedding: number[],

  object: 'embedding'
}

export type RequestResult = {
  object: 'list',
  data: Embedding[],
  model: string,
  usage: object
};
