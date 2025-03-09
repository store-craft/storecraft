import { config } from "./types.js"

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
