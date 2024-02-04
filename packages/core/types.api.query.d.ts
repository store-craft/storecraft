// Query types
import type { VQL } from './v-ql/types';
export type ApiQuerySortOrder = 'asc' | 'desc';
export type Cursor<T=string> = [key: 'updated' | 'created' | 'id', value: T];

/** Expend several relations */
export type ExpandQuery = string[];

/**
 * Query url base type for most collections
 */
export type ParsedApiQuery = {
  expand?: ExpandQuery;
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  vql?: VQL.AST;

  /**
   * order of the query:
   * 1. If startAt/endAt=(updated:2012..), it will order by `updated_at`
   * 2. if startAt===undefined, it will sort by `updated_at`
   * 3. If startAt/endAt=(created:2012..), it will order by `created_at`
   */
  order?: ApiQuerySortOrder;

  /**
   * limit of items returned
   */
  limit?: number;

  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  startAt?: Cursor[];
  startAfter?: Cursor[];

  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: Cursor[];
  endBefore?: Cursor[];
}
