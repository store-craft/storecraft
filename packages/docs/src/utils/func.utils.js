/**
 * Transforms a string into a handle
 * @param {string} title 
 */
export const to_handle = (title) => {
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
