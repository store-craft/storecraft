import { Document } from "mongodb"

export type MongoVectorDocument = {
  id: string,
  metadata: Record<string, any>,
  embedding: number[],
  pageContent: string,
  updated_at: string,
  score?: number
  namespace?: string
}

export type mongo_vectorSearch_pipeline = {
  /** 
   * This is required if numCandidates is omitted.
   * Flag that specifies whether to run ENN or ANN search. Value can be one of the following: 
   * - false - to run ANN search
   * - true - to run ENN search 
   * 
   * If omitted, defaults to false. 
   */
  exact?: boolean

  /**
   * Any MQL match expression that compares an indexed field with a boolean, date, objectId, number (not decimals), string, or UUID to use as a pre-filter. To learn which query and aggregation pipeline operators Atlas Vector Search supports in your filter, see Atlas Vector Search Pre-Filter.
   */
  filter?: Document

  /** Name of the Atlas Vector Search index to use. Atlas Vector Search doesn't return results if you misspell the index name or if the specified index doesn't already exist on the cluster. */
  index:  string

  /** Number (of type int only) of documents to return in the results. This value can't exceed the value of numCandidates if you specify numCandidates. */
  limit: number

  /** This field is required if exact is false or omitted. Number of nearest neighbors to use during the search. Value must be less than or equal to (<=) 10000. You can't specify a number less than the number of documents to return (limit). We recommend that you specify a number higher than the number of documents to return (limit) to increase accuracy although this might impact latency. For example, we recommend a ratio of ten to twenty nearest neighbors for a limit of only one document. This overrequest pattern is the recommended way to trade off latency and recall in your ANN searches, and we recommend tuning this on your specific dataset. */
  numCandidates?: number

  /** Indexed vector type field to search. */
  path: string

  /** Array of numbers of the BSON double, BSON BinData vector subtype float32, or BSON BinData vector subtype int1 or int8 type that represent the query vector. The number type must match the indexed field value type. Otherwise, Atlas Vector Search doesn't return any results or errors */
  queryVector: number[]

}