import { getDocs, addDoc, getDoc,
  doc, collection, deleteDoc, query, where, 
  startAt, endAt, orderBy, limit, startAfter, 
  getDocsFromCache, getDocsFromServer, 
  getCountFromServer } from "@firebase/firestore";
import { endBefore, limitToLast } from "firebase/firestore";
import { writeBatch, serverTimestamp } from "firebase/firestore"; 

const toWhere = (items) => {
  return items.map(item => where(...item))
}

const toOrder = (items) => {
  return items.map(item => orderBy(item[0], item[1]))
}

const q_sample = {
  where: [['field_name', 'op', 'value']],
  orderBy: [['field_1', 'asc/desc'], ['field_2', 'asc/desc']],
  limit: 25,
  startAt: ['field_1_some_value', 'field_2_some_value', 'or a document snapshot'],
  endAt: ['field_1_some_value', 'field_2_some_value']
}

const toQuery = async (ref, q) => {
  const w = toWhere(q?.where ? q.where : [])
  const o = toOrder(q?.orderBy ? q.orderBy : [])

  const s1 = q?.startAt?.length ? startAt(...q.startAt) : undefined
  const s2 = q?.startAfter?.length ? startAfter(...q.startAt) : undefined
  const e1 = q?.endAt?.length ? endAt(...q.endAt) : undefined
  const e2 = q?.endBefore?.length ? endBefore(...q.endAt) : undefined
  let l1 = q?.limit ? limit(parseInt(q.limit)) : undefined
  let l2 = q?.limitToLast ? limitToLast(parseInt(q.limitToLast)) : undefined

  if(q?.startAfterId) {
    const snap = await getDoc(doc(ref, q.startAfterId))
    // console.log('q', q)
    // console.log('snap', snap)
    // console.log('snap.exists', snap.exists)

    var x1 = snap.exists() ? startAfter(snap) : undefined
  }
  if(q?.startAtId) {
    const snap = await getDoc(doc(ref, q.startAtId))
    var x2 = snap.exists() ? startAt(snap) : undefined
  }
  if(q?.endAtId) {
    const snap = await getDoc(doc(ref, q.endAtId))
    var x3 = snap.exists() ? endAt(snap) : undefined
    l1 = undefined
    l2 = q?.limit ? limitToLast(parseInt(q.limit)) : undefined
  }
  if(q?.endBeforeId) {
    const snap = await getDoc(doc(ref, q.endBeforeId))
    var x4 = snap.exists() ? endBefore(snap) : undefined
    l1 = undefined
    l2 = q?.limit ? limitToLast(parseInt(q.limit)) : undefined
  }

  const r = [ref, ...w, ...o];

  [s1, s2, e1, e2, l1, l2, x1, x2, x3, x4].forEach(
    it => {
      if(it)
        r.push(it)
    }
  )
  // console.trace()
  // console.log('r', r)

  const final = query(...r)

  return final
}

/**
 * 
 * @param { import("../firebase").Firebase } ctx 
 * @param {string | undefined} colId 
 * @returns 
 */
const colHandler = (ctx, colId) => {
  const that = this

  return {

    /**
     * 
     * @param {*} query 
     */
    count : async (query={}) => {
      try {
        const q = await toQuery(collection(ctx.db, colId), query)
        const snapshot = await getCountFromServer(q)
        return snapshot.data().count          
      } catch (e) {
        return 0
      }
    },

    /**
     * 
     * @param {*} q query
     * @param {boolean} from_cache 
     * @returns {Promise<[string, any][]>}
     */
    list_with_filters : async (q = { limit:25 }, from_cache=false) => {
      q = await toQuery(collection(ctx.db, colId), q)
      const snap = from_cache ? await getDocsFromCache(q) : await getDocsFromServer(q)
      return snap.docs.map(it => [it.id, it.data()])
    },

    /**
     * 
     * @param {boolean} from_cache 
     */
    list : (from_cache=false) => that.list_with_filters({}, from_cache),
    
    /**
     * @template T {}
     * @param {object} base_query 
     */
    paginate2 : async (base_query, from_cache=false) => {
      // console.log('query ', base_query);
      const ref = collection(ctx.db, colId)
      let last_doc = undefined
      let exhausted_next = false
      let q = await toQuery(ref, base_query)
    
      /**
       * @typedef {[string, T]} Item
       * @returns {Promise<[string, T][]>}
       */
      const next = async () => {
        if(exhausted_next)
          throw new Error('end')

        const cq = last_doc ? query(q, startAfter(last_doc)) : q
        const snap = from_cache ? await getDocsFromCache(cq) : 
                                  await getDocsFromServer(cq)
        const len = snap.docs.length
        if(len==0) {
          exhausted_next=true
        }
        last_doc = len ? snap.docs[len-1] : undefined
        return snap.docs.map(it => [it.id, it.data()])
      }
      return next
    },

    /**
     * @template T {}
     * @param {object} base_query 
     */
    paginate3 : async (base_query, from_cache=false) => {
      // console.log('query ', base_query);
      const ref = collection(ctx.db, colId)
      const q = await toQuery(ref, base_query)
      let last_doc = undefined
      let first_doc = undefined
      let exhausted = false
    
      /**
       * @typedef {[string, T]} Item
       * @returns {Promise<[string, T][]>}
       */
      const next = async () => {
        const cq = last_doc ? query(q, startAfter(last_doc)) : q
        const snap = from_cache ? await getDocsFromCache(cq) : 
                                  await getDocsFromServer(cq)
        const len = snap.docs.length
        if(len==0) {
          exhausted=true
          throw new Error('end')
        }
        last_doc = len ? snap.docs[len-1] : undefined
        first_doc = len ? snap.docs[0] : undefined
        return snap.docs.map(it => [it.id, it.data()])
      }

      /**
       * @typedef {[string, T]} Item
       * @returns {Promise<[string, T][]>}
       */
      const prev = async () => {
        if(first_doc)
          throw new Error('start')
        const cq = first_doc ? query(q, endBefore(first_doc)) : q
        const snap = from_cache ? await getDocsFromCache(cq) : 
                                  await getDocsFromServer(cq)
        const len = snap.docs.length
        if(len==0) {
          exhausted=true
          throw new Error('end')
        }
        last_doc = len ? snap.docs[len-1] : undefined
        first_doc = len ? snap.docs[0] : undefined
        return snap.docs.map(it => [it.id, it.data()])
      }

      return {
        prev, next, first_doc, last_doc
      }
    },

    /**
     * 
     * @param {string} docId 
     */
    remove : (docId) => deleteDoc(doc(ctx.db, colId, docId)),

    /**
     * 
     * @param {object} data 
     * @returns id
     */
    add : async (data) => {
      const doc_ref = await addDoc(collection(ctx.db, colId), data)
      return doc_ref.id
    },

    /**
     * 
     * @param {object[]} data 
     */
    addBulk: async (data=[]) => {
      const batch = writeBatch(ctx.db)
      data.forEach(
        it => {
          it = {
            ...it,
            updatedAt: Date.now()
          }
          batch.set(doc(collection(ctx.db, colId)), it)
        }
      )
      return batch.commit()
    }

  }
}

export default colHandler