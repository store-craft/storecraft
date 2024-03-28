import { ref, uploadBytes, UploadMetadata,
         uploadString, getDownloadURL, 
         getBlob, deleteObject } from 'firebase/storage'
import { StorecraftAdminSDK } from '../..'
import { FirebaseStorageSettings } from '../../js-docs-types'

/**
 * Given S3 endpoint, bucket and key, create a URL
 * @param {FirebaseStorageSettings} settings 
 * @param {string} key 
 */
export const toUrlWithCustomDomain = (settings, url) => {
  if(!settings.custom_domain)
    return url

  const uurrll = new URL(settings.custom_domain)
  uurrll.pathname = key
  return uurrll.toString()
}
 
export default class Storage {

  /** 
   * @param {StorecraftAdminSDK} ctx of
   * @param {FirebaseStorageSettings} settings of
   **/
  constructor(ctx, settings) {
    this._settings = settings
    this.storage = ctx.firebase.storage
    this.ctx = ctx
  }

  /** @param {string} path */
  toRef = (path) => {
    return ref(this.storage, path)
  }


  /**
   * @param {string} ref 
   * @returns {boolean}
   */
  doesThisRefBelongsToMe = (ref) => {
    return ref.startsWith('gs://')
  }

  /**
   * 
   * @param {string} ref 
   */
  getBlobByRef = async (ref) => {
    return getBlob(this.toRef(ref))
  }

  /**
   * 
   * @param {string} ref 
   */
  deleteByRef = async (ref) => {
    const r = this.toRef(ref)
    return deleteObject(r)
  }

  /**
   * @param {string} path 
   */
  getBlob = async (path, process = x => x) => {
    const ref = this.toRef(path)
    return this.getBlobByRef(ref)
  }

  /**
   * 
   * @param {string} path 'a/b/c.jpeg'
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * @param { UploadMetadata | undefined} data 
   * @returns {[url: string, name: string, uri: string]} a triple [url, name, firebase uri]
   */
  uploadBytes = async (path, data, metaData = undefined) => {
    const ref = this.toRef(path)
    const func = typeof data === 'string' ? 
          async () => uploadString(ref, data, 'raw', metaData) : 
          async () => uploadBytes(ref, data, metaData)
    const uploadResult = await func()
    let url = await getDownloadURL(ref)
    const cd = this._settings.custom_domain
    if(cd) {
      try {
        const uurrll = new URL(url)
        const path = decodeURIComponent(uurrll.pathname?.split('/')?.pop())
        const mode_url = new URL(cd)
        mode_url.pathname = path
        url = mode_url.toString()
      } catch (e) {
      }

    }
    return [url, ref.name, ref.toString()]
  }

}