import S3 from './drivers/storage/s3'
import Google from './drivers/storage/google'

import { StorecraftAdminSDK } from '.'
import { 
  FirebaseStorageSettings, ImageData, 
  S3CompatibleStorageSettings, 
  StorageTypeEnum } from './js-docs-types'

export default class Storage {

  /** @param {StorecraftAdminSDK} ctx of*/
  constructor(ctx) {
    this.ctx = ctx
  }
  
  /**
   * get a blob from the current selected storage
   * @param {string} path 
   * @param {(x: Blob) => any} process 
   * @returns
   */
  getBlob = async (path, process = x => x) => {
    const [exists, _, main_settings] = await this.ctx.settings.get('main')

    const id = main_settings?.storage?.selected ?? StorageTypeEnum.google_cloud_storage
    const storage_settings = main_settings?.storage?.items?.[id]
    const driver = this.storageById(id, storage_settings)

    const blob = await driver.getBlob(path)
    return process(blob)
  }

  /** @param {string} path  */
  getString = (path) => this.getBlob(path, blob => blob.text())
  /** @param {string} path  */
  getJson = (path) => this.getBlob(path, blob => blob.text().then(JSON.parse))
  /** @param {string} path  */
  getImage = (path) => this.getBlob(path, blob => URL.createObjectURL(blob))

  /**
   * given a url like reference, find the storage it belongs to
   * @param {string} ref url or uri like
   */
  getDriverByRef = async (ref) => {
    const [exists, _, main_settings] = await this.ctx.settings.get('main', true)

    const id = main_settings?.storage?.selected ?? StorageTypeEnum.google_cloud_storage
    const items = {       
      [StorageTypeEnum.google_cloud_storage]: {},
      ...main_settings?.storage?.items
    }

    try {
      const storage = Object.entries(items).map(
        ([key, settings]) => this.storageById(key, settings)
      ).find(
        s => s.doesThisRefBelongsToMe(ref)
      )
      return storage
    } catch(e) {
    }

    return undefined
  }

  deleteByRef = async (ref) => {
    const driver = await this.getDriverByRef(ref)
    if(driver===undefined)
      return;

    return driver.deleteByRef(ref)
  }

  /**
   * get file source by inspecting the url and figuring out in which
   * storage ir resides and then fetch it by the correct storage driver
   * @param {string} url 
   * @param {boolean} isImage 
   */
  getSource = async (url, isImage=true) => {
    try {
      const driver = await this.getDriverByRef(url)

      // if we havent found a driver, rturn the url
      if(driver===undefined)
        return url;

      const blob = await driver.getBlobByRef(url)
      if(isImage)
        return URL.createObjectURL(blob)
      else
        return blob.text().then(JSON.parse)    
    } catch(e) {
      console.log(e)
    }
    return url;
  }

  /**
   * get file source by inspecting the url and figuring out in which
   * storage ir resides and then fetch it by the correct storage driver
   * @param {string} url 
   * @param {boolean} isImage 
   */
  getSource2 = async (url, isImage=true) => {
    const [exists, _, main_settings] = await this.ctx.settings.get('main', true)

    const id = main_settings?.storage?.selected ?? StorageTypeEnum.google_cloud_storage
    const items = main_settings?.storage?.items ?? {}

    try {

      const match = Object.entries(items).find(
        ([key, settings]) => {
          const isS3 = key!==StorageTypeEnum.google_cloud_storage

          if(!isS3)
            return false

          /**@type {S3CompatibleStorageSettings} */  
          let settings_casted = settings
          const endpoint = settings_casted?.endpoint

          if(!endpoint)
            return false

          const eurl = new URL(endpoint)
            
          const includes = url.includes(eurl.hostname)
          return includes
        }
      )

      if(match) {
        const [key, value] = match
        const isS3 = key!== StorageTypeEnum.google_cloud_storage
        if(!isS3)
          return url;

        // handle S3
        /**@type {S3CompatibleStorageSettings} */
        const settings = value
        const force_path_style = settings?.force_path_style ?? false
        const driver = this.storageById(key, settings)
        const eurl = new URL(settings.endpoint)
        const uurrll = new URL(url)
        let pathname = uurrll.pathname
        if(pathname.startsWith('/'))
          pathname = pathname.slice(1)

        // detect if s3 url is path style or virtual style
        const is_path_style = uurrll.host.startsWith(eurl.host)

        let path_key = pathname
        if(is_path_style)
          path_key = pathname.split('/').slice(1).join('/')

        const blob = await driver.getBlob(path_key)
        if(isImage)
          return URL.createObjectURL(blob)
        else
          return blob.text().then(JSON.parse)
      }
    } catch(e) {
      console.log(e)
    }

    return url;
  }

  /**
   * 
   * @param {string} id 
   * @param {S3CompatibleStorageSettings | FirebaseStorageSettings} settings 
   * @returns 
   */
  storageById = (id, settings) => {
    switch (id) {
      case StorageTypeEnum.google_cloud_storage:
        return new Google(this.ctx, settings)
     default:
        return new S3(this.ctx, settings)
    }
  }

  /**
   * 
   * @param {string} path 'a/b/c.jpeg'
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * @param { import('firebase/storage').UploadMetadata | undefined} data 
   * @returns {[url: string, name: string, ref: string]} a triple [url, name, firebase uri]
   */
  uploadBytes = async (path, data, metaData = undefined) => {

    const [exists, _, main_settings] = await this.ctx.settings.get('main')

    const id = main_settings?.storage?.selected ?? StorageTypeEnum.google_cloud_storage
    const storage_settings = main_settings?.storage?.items?.[id]

    const driver = this.storageById(id, storage_settings)
    return driver.uploadBytes(path, data, metaData)
  }

  /**
   * 
   * @param {string} path 'a/b/c.jpeg'
   * @param {string | Blob | Uint8Array | ArrayBuffer | File} data 
   * @param {'jpeg' | 'png' | 'webp'} type image type
   * @returns {[string, string, string]} a triple [url, name, firebase uri]
   */
  uploadImage = async (path, data, type='jpeg', metaData={}) => {
    const [url, name, ref] = await this.uploadBytes(
      path, data, { 
        contentType : `image/${type}`,
        ...metaData
      }
    )

    /**@type {ImageData} */
    const img_data = {
      handle: name,
      name,
      url, 
      ref
    }
    await this.ctx.images.create(img_data)
    return [url, name, ref]                        
  }

}