let a = { 
  $or: [
    { updated_at: { $gt: '2024-01-24T20:28:24.126Z'} },
    { $and : [ { updated_at: '2024-01-24T20:28:24.126Z' }, { id: { $gte : 'tag_65b172ebc4c9552fd46c1027'}}]}
  ], 
}
//
// 1. (a1, a2) >  (b1, b2) IFF (a1 > b1) || (a1=b1 & a2>b2)
// 2. (a1, a2) >= (b1, b2) IFF (a1 > b1) || (a1=b1 & a2>=b2)
// 3. (a1, a2, a3) >  (b1, b2, b3) IFF (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
// 4. (a1, a2, a3) >= (b1, b2, b3) IFF (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
//
// ABD
// ABA
//

const UPDATED = 'updated_at';
const CREATED = 'created_at';
const ID = 'id';

/**
 * Convert an API Query cursor into mongo dialect, also sanitize.
 * 
 * 1. (a1, a2) >  (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>b2)
 * 2. (a1, a2) >= (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>=b2)
 * 3. (a1, a2, a3) >  (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
 * 4. (a1, a2, a3) >= (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
 * 
 * @param {import("@storecraft/core").Cursor[]} c 
 * @param {'>' | '>=' | '<' | '<='} relation 
 */
export const query_cursor_to_mongo = (c, relation) => {

  let rel_key_1; // relation in last conjunction term in [0, n-1] disjunctions
  let rel_key_2; // relation in last conjunction term in last disjunction

  if (relation==='>' || relation==='>=') {
    rel_key_1 = rel_key_2 = '$gt';
    if(relation==='>=')
      rel_key_2='$gte';
  }
  else if (relation==='<' || relation==='<=') {
    rel_key_1 = rel_key_2 = '$lt';
    if(relation==='<=')
      rel_key_2='$lte';
  } else return undefined;

  const disjunctions = [];
  // each disjunction clause
  for (let ix = 0; ix < c.length; ix++) {
    const is_last_disjunction = ix==c.length-1;
    const conjunctions = [];
    // each conjunction clause up until the last term (not inclusive)
    for (let jx = 0; jx < ix; jx++) {
      // the a_n=b_n
      conjunctions.push({ [c[jx][0]] : c[jx][1] });
    }

    // Last conjunction term
    const relation_key = is_last_disjunction ? rel_key_2 : rel_key_1;
    conjunctions.push({ [c[ix][0]] : { [relation_key]: c[ix][1] } });
    // Add to disjunctions list
    disjunctions.push({ $and: conjunctions });
  }

  if(disjunctions.length==0)
    return undefined;

  const result = {
    $or: disjunctions
  };

  return result;
}

/**
 * Convert an API Query into mongo dialect, also sanitize.
 * @param {import("@storecraft/core").ParsedApiQuery} q 
 */
export const query_to_mongo = (q) => {
  const filter = {};
  const CON = []; // conjunctions
  const sort = { _id: 1 };

  if(q.startAt) {
   
  }

}
