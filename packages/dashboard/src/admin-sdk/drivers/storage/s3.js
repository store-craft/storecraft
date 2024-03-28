import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { StorecraftAdminSDK } from '../..'
import { S3CompatibleStorageSettings } from '../../js-docs-types';

/**
 * Given S3 endpoint, bucket and key, create a URL
 * @param {S3CompatibleStorageSettings} settings 
 * @param {string} key 
 */
export const toUrl = (settings, key) => {
  const uurrll = new URL(settings.endpoint)
  uurrll.pathname = key
  if(settings.force_path_style) {
    uurrll.pathname = settings.bucket + uurrll.pathname
  } else {
    uurrll.hostname = settings.bucket + '.' + uurrll.hostname
  }
  return uurrll.toString()
 }

 /**
 * Given S3 endpoint, bucket and key, create a URL
 * @param {S3CompatibleStorageSettings} settings 
 * @param {string} key 
 */
export const toUrlWithCustomDomain = (settings, key) => {
  if(!settings.custom_domain)
    return toUrl(settings, key)

  const uurrll = new URL(settings.custom_domain)
  uurrll.pathname = key
  return uurrll.toString()
}
 
export default class Storage {

  /** 
   * @param {StorecraftAdminSDK} ctx of
   * @param {S3CompatibleStorageSettings} settings of
   **/
  constructor(ctx, settings) {
    this.ctx = ctx
    this._settings = settings

    const endpoint = this._settings?.endpoint
    const forcePathStyle = this._settings?.force_path_style ?? false
    const accessKeyId = this._settings?.access_key
    const secretAccessKey = this._settings?.secret
    const region = 'auto'
  
    this._S3 = new S3Client({
      forcePathStyle,
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  /**
   * Did this storage driver generate this reference
   * @param {string} ref 
   * @returns {boolean}
   */
  doesThisRefBelongsToMe = (ref) => {
     const endpoint = this._settings?.endpoint

     if(!endpoint)
       return false

     const eurl = new URL(endpoint)
       
     const includes = ref.includes(eurl.hostname)
     return includes
  }


  /**
   * Given a url ref, parse the key and bucket
   * @param {string} ref 
   * @returns {{key: string, bucket: string}}
   */
  parseRef = (ref) => {
    const settings = this._settings
    const force_path_style = settings?.force_path_style ?? false
    // const driver = this.storageById(key, settings)
    const eurl = new URL(settings.endpoint)
    const uurrll = new URL(ref)
    let pathname = uurrll.pathname
    if(pathname.startsWith('/'))
      pathname = pathname.slice(1)

    // detect if s3 url is path style or virtual style
    const is_path_style = uurrll.host.startsWith(eurl.host)

    let path_key = pathname
    if(is_path_style)
      path_key = pathname.split('/').slice(1).join('/');

    const bucket = is_path_style ? pathname.split('/').at(0) : uurrll.hostname.split('.').at(0)

    return {
      key: path_key,
      bucket
    }
  }

  /**
   * ref is another URL like identifier that the storage driver
   * know how to generate, this is it's main and prime location
   * source of truth, it can be a url or anything that is locatable
   * @param {string} ref 
   */
  getBlobByRef = async (ref) => {
    const { key } = this.parseRef(ref)
    return this.getBlob(key)
  }

  /**
   * @param {string} path 
   */
  getBlob = async (path) => {
    const bucket = this._settings?.bucket
    const cmd = new GetObjectCommand(
      {
        Bucket: bucket,
        Key: path,
      }
    )

    const result = await this._S3.send(cmd)
    /**@type {ReadableStream} */
    const stream = result.Body
    const ba = await stream.transformToByteArray()
    const blob = new Blob([ba])
    return blob
  }

  /**
   * 
   * @param {string} ref 
   */
  deleteByRef = async (ref) => {
    const { key, bucket } = this.parseRef(ref)
    const cmd = new DeleteObjectCommand(
      {
        Key: key,
        Bucket: bucket
      }
    )

    const result = await this._S3.send(cmd)
  }

  /**
   * 
   * @param {string} path 'a/b/c.jpeg'
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * @param { UploadMetadata | undefined} data 
   * @returns {[string, string, string]} a triple [url, name, firebase uri]
   */
  uploadBytes = async (path, data, metaData = undefined) => {
    const bucket = this._settings?.bucket
    const Headers = Object.entries(metaData).reduce(
      (p, [k, v]) => {
        const key = k[0].toUpperCase() + k.slice(1)
        p[key] = v
        return p
      }, {}
    )

    const cmd = new PutObjectCommand(
      {
        Bucket: bucket,
        Key: path,
        ACL: 'public-read',
        Body: data,
        ...Headers,
      }
    )

    const result = await this._S3.send(cmd)

    // const base = await this._S3.config.endpoint()
    
    const name = path?.split('/').pop()
    const api_url = toUrl(this._settings, path)
    const url = toUrlWithCustomDomain(this._settings, path)
      
    return [url, name, api_url]
  }

}