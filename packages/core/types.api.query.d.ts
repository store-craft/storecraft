// Query types
export type ApiQuerySortOrder = 'asc' | 'desc';

/**
 * Query url base type for most collections
 */
export type ApiQueryBaseURL = {
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  q?: string;
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
  startAt?: [
    a:number, b:string
  ]
  startAfter?: string;
  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: string;
  endBefore?: string;
}

export type KeyValue<T=string> = [key: 'updated' | 'created' | 'id', value: T];

import type { VQL } from './v-ql/types';

/**
 * Query url base type for most collections
 */
export type ParsedApiQuery = {
  /**
   * boolean DSL for filtering the terms
   * (whatever-indexed tag:a -(tag:b | tag:c) handle:product*)
   */
  q?: VQL.AST;

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
  startAt?: KeyValue[];
  startAfter?: KeyValue[];

  /**
   * (updated:2012-09)
   * (updated:2012-09,id:aokaoskox)
   * (created:2012-09,id:aokaoskox)
   */
  endAt?: KeyValue[];
  endBefore?: KeyValue[];
}
