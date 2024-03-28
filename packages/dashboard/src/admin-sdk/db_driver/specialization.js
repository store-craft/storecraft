import { 
  DocumentSnapshot, Firestore, 
  Transaction, doc, runTransaction } from 'firebase/firestore'
import { ImageData } from '../js-docs-types';
import { union_array } from '../common/utils/functional';
import { url2name } from '../images';

/**
 * @typedef {object} BaseData
 * @property {number} updatedAt
 * @property {string[]} media
 * 
 * @template T
 * @param {string} id 
 * @param {Firestore} db
 * @param {T} data
 * @param {(transaction: Transaction ,x: T) => T} effect
 * @returns {Promise<[id: string, data: ProductData]>}
 */
 export const setWithImagesTransaction = async (db, collectionId, docId, data, effect = (t, x) => x) => {
  const tran = runTransaction(
    db,
    async t => {
      // first get the document
      /**@type {DocumentSnapshot<BaseData>} */
      const snap_me = await t.get(doc(db, collectionId, docId))
      if(snap_me.exists()) {
        if(snap_me.data().updatedAt && snap_me.data().updatedAt > data.updatedAt)
          throw 'This document was updated elsewhere, please hit the reload button'
      }

      // get the medias
      const prev_media = snap_me.data()?.media ?? []
      const current_media = data?.media ?? []
      const all_media = union_array(
        prev_media, current_media
        )
      /**@type {DocumentSnapshot<ImageData>[]} */
      const snap_images = await Promise.all(
        all_media?.map(
          async m => await t.get(doc(db, 'images', url2name(m)))
        )
      )

      // perform side effects
      const after_effect = await effect(t, data)
      //
      
      // set me
      t.set(snap_me.ref, after_effect)

      // now, let's set images data
      const usage_term = `${collectionId}/${docId}`

      snap_images?.forEach(
        (snap_img, ix) => {
          const url = all_media[ix]
          /**@type {ImageData} */
          const img = snap_img.data() ?? {
            handle: url2name(url),
            name: url2name(url),
            url: url,
            search: [],
            usage_count: 0,
            usage: [],
            updatedAt: Date.now(),
            createdAt: Date.now()
          }
          
          const included_prev = prev_media.includes(url)
          const included_currently = current_media.includes(url)
          if(included_prev && included_currently) {
            // nothing todo
          }
          else if(included_prev && !included_currently) {
            // removed
            img.usage = img.usage.filter(u => u!==usage_term)
          }
          else if(!included_prev && included_currently) {
            // newly added
            img.usage = [usage_term, ...img.usage.filter(u => u!==usage_term)]
          }

          img.usage_count = img.usage.length

          t.set(snap_img.ref, img)
        }
      )

      return after_effect
    }
  )

  return tran
}
