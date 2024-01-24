let a = { 
  $or: [
    { updated_at: { $gt: '2024-01-24T20:28:24.126Z'} },
    { $and : [ { updated_at: '2024-01-24T20:28:24.126Z' }, { id: { $gte : 'tag_65b172ebc4c9552fd46c1027'}}]}
  ], 
}

/**
 * Convert an API Query into mongo dialect
 * @param {import("@storecraft/core").ParsedApiQuery} q 
 */
export const query_to_mongo = (q) => {
  if(q.startAt) {
    
  }
}