export type cf_response_wrapper<T extends any = undefined> = {
  success: boolean,
  errors?: { code: number, message: string }[];
  messages?: { code: number, message: string }[];
  result?: T
}

export type RequestBody = {
  text: string | string[]
}

export type RequestResult = {
  shape:  number[],
  data: number[][];
};
