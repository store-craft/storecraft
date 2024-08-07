

export type ApiResponse<Result extends any = any> = {
  errors: string[],
  messages: string[],
  result?: Result,
  success: boolean;
  result_info?: {
    count: number,
    page: number,
    per_page: number,
    total_count: number
  }
}

export type ListDatabasesResponse = ApiResponse<
  {
    created_at: string,
    name: string,
    uuid: string,
    version: string,
  }
>;

export type CreateDatabaseResponse = ApiResponse<
  {
    created_at: string,
    name: string,
    uuid: string,
    version: string,
  }
>;

export type DeleteDatabaseResponse = ApiResponse<boolean>;

export type GetDatabaseResponse = ApiResponse<
  {
    "created_at": string,
    "file_size": number,
    "name": string,
    "num_tables": number,
    "uuid": string,
    "version": string
  }
>;

export type QueryDatabaseResponse = ApiResponse<
  {
    "meta": {
      "changed_db": boolean,
      "changes": number,
      "duration": number,
      "last_row_id": number,
      "rows_read": number,
      "rows_written": number,
      "size_after": number
    },
    "results"?: any[],
    "success": boolean
  }[]
>;

export type RawDatabaseResponse = QueryDatabaseResponse;

export type QueryDatabaseParams = {
  /**
   * @description Body param: Your SQL query. Supports multiple statements, joined by semicolons,
   * which will be executed as a batch.
   */
  sql: string;

  /**
   * @description Body param:
   */
  params?: string[];
}

export type RawDatabaseParams = QueryDatabaseParams;