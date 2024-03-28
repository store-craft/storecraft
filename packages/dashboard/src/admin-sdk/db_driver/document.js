
// import { updateDoc, addDoc, getDoc, setDoc, doc, collection } from "@firebase/firestore";

import { updateDoc, addDoc, getDoc, getDocFromCache, 
         getDocFromServer, setDoc,
         doc, collection, increment, 
         runTransaction, DocumentData } from "@firebase/firestore";
import { StorecraftAdminSDK } from ".."

/**
 * 
 * @param { import("../firebase").Firebase } ctx 
 * @param {string} colId 
 * @param {string | undefined} docId 
 * @returns 
 */
const docHandler = (ctx, colId, docId=undefined) => {
  const that = this

  return {
    /**
     * 
     * @param {boolean} try_cache_first 
     * @returns {Promise<[boolean, string, DocumentData|undefined]>}
     */
    get : async (try_cache_first=true) => {
      const ref = doc(ctx.db, colId, docId)
      if(try_cache_first) {
        try {
          const snap = await getDocFromCache(ref)
          if(snap.exists())
            return [snap.exists(), snap.id, snap.data()]
        } catch (e) {
        }
      }

      // try server
      const snap = await getDocFromServer(ref)
      return [snap.exists(), snap.id, snap.data()]
    },

    /**
     * 
     * @param {*} data 
     * @returns {string} id
     */
    update : async (data) => {
      await updateDoc(doc(ctx.db, colId, docId), data)
      return docId
    },

    /**
     * 
     * @param {*} data 
     * @returns {string} id
     */
    set : async (data) => {
      await setDoc(doc(ctx.db, colId, docId), data)
      return docId
    },

    /**
     * 
     * @param {*} data 
     * @returns {string} id
     */
    create : async (data) => {
      const doc_ref = await addDoc(collection(ctx.db, colId), data)
      return doc_ref.id
    },
    
    /**
     * 
     * @param {string} field field to increment 'can be nested', i.e 'a.b.c'
     * @param {number} howmuch number, negative or positive
     * @param {number} min 
     * @param {number} max 
     * @throws object with code 'doc-not-exists' / 'out-of-bounds' / 'field-not-exists'
     */
    incrementField : (field, howmuch, min=Number.NEGATIVE_INFINITY, 
                      max=Number.POSITIVE_INFINITY) => {
      return runTransaction(ctx.db, 
        async transaction => {
          const doc_ref = doc(ctx.db, colId, docId)
          const sfDoc = await transaction.get(doc_ref)
          if (!sfDoc.exists()) {
            throw {
              code: 'doc-not-exists',
              msg: 'Item does not exist'
            }
          }
          
          let data = 0
          try {
            data = field.split('.').reduce((p, c) => p[c], sfDoc.data())

          } catch (e) {
            throw {
              code: 'field-not-exists',
              msg: 'Item does not exist'
            }
          }

          const newData = data + howmuch
          if (newData < min || newData > max)
            throw {
              code: 'out-of-bounds',
              msg: 'Out of bounds'
            }
          
          transaction.update(doc_ref, { [field]: newData });

          return newData          
        })
                
    }

  }
}

export default docHandler
