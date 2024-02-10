
/**
 * prefer signed url get by default
 * @param {URLSearchParams} search_params
 */
export const does_prefer_signed = search_params => {
  return (search_params?.get('signed')?.trim() ?? 'true') !== 'false'
}


