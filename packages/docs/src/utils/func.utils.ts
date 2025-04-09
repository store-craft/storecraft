/**
 * Transforms a string into a handle
 */
export const to_handle = (title: string) => {
  if(typeof title !== 'string')
    return undefined
  let trimmed = title.trim()
  if(trimmed === "")
    return undefined
  
  trimmed = trimmed.toLowerCase().match(/[\p{L}\d]+/gu).join('-')
  if(trimmed.length==0)
      return undefined
  
  return trimmed
}
