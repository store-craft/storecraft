/**
 * Transforms a string into a handle
 */
export const to_handle = (title: string) => {
  if(typeof title !== 'string')
    return undefined;

  let trimmed : string = title.trim();

  if(trimmed === "")
    return undefined
  
  const handle = trimmed?.toLowerCase().match(/[\p{L}\d]+/gu)?.join('-')

  return handle
}
