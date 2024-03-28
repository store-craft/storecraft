import docHandler from './document'
import colHandler from './collection'
import { StorecraftAdminSDK } from '..'
import { setWithImagesTransaction } from './specialization'

export default class FirebaseDB {
  /**
   * 
   * @param {StorecraftAdminSDK} ctx 
   */
  constructor(ctx) {
    this.ctx = ctx
    this.firebaseDB = ctx.firebase.db
  }

  /**
   * 
   * @param {string} colId 
   * @param {string | undefined} docId 
   */
  doc = (colId, docId=undefined) => {
    return docHandler(this.ctx.firebase, colId, docId)
  }

  /**
   * 
   * @param {string} colId 
   */
  col = (colId) => {
    return colHandler(this.ctx.firebase, colId)
  }

  specialization = () => (
    {
      setWithImagesTransaction
    }
  )

}