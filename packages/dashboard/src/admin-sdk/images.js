// import { Transaction, arrayRemove, arrayUnion, doc, updateDoc, writeBatch } from "firebase/firestore"
import { StorecraftAdminSDK } from "."
import { text2tokens, union_array } from "./common/utils/functional"
import { ImageData } from './js-docs-types'

const p = (m) => new Promise(
  (resolve, reject) => {
    setTimeout(resolve, m)
  }
)

/**
 * @param {object} data
 * @returns {string[]}
 */
export const extract_search_terms_from_regular_doc = (data) => {
  const terms = []
  const title = data?.title?.toLowerCase()
  if (title) 
    terms.push(title, ...text2tokens(data.title.toLowerCase()))
  // if we see tags, push their values
  terms.push(...(data?.tags?.map(tag => tag.split('_').pop()) ?? []))

  return terms
}

/**
 * @param {ImageData} data 
 * @returns {string[]}
 */
export const create_search_index = (data) => {
  const index = [data.name]
  const name2 = data?.name && decodeURIComponent(data?.name?.toLowerCase())
  if(name2) {
    const real_name = name2?.split('.')?.slice(0, -1)?.join('.')
    if(real_name)
      index.push(real_name)
  }
  // const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return index
}

/**
 * Convert a url to name by first decode URI -> take last piece after '/' and then
 * take off the '?' query part
 * @param {*} url 
 * @returns 
 */
export const url2name = url => decodeURIComponent(String(url)).split('/').pop().split('?')[0]

const NAME = 'images'

export default class Images {

  /** @param {StorecraftAdminSDK} context */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[exists: boolean, id: string, data: ImageData]>}
   */
  get = (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * @param {string} id 
   * @param {ImageData} data 
   * @returns id
   */
  update = (id, data) => {
    id = data.handle
    return this.db.doc(NAME, id).update(data)
  }

  // /**
  //  * 
  //  * @param {string} id 
  //  * @param {string[]} terms 
  //  * @returns 
  //  */
  // updateSearchTerms = async (id, terms=[]) => {
  //   const isUsable = Array.isArray(terms) && terms.length>0
  //   if(!isUsable)
  //     return
  //   await this.db.doc(NAME, id).update({
  //     search: arrayUnion(...terms.map(t => String(t)))
  //   })
  // }

  // /**
  //  * 
  //  * @param {string} id 
  //  * @param {string[]} terms 
  //  * @param {string[]} usage 
  //  */
  // _updateSearchTermsAndUsage = async (id, terms=[], usage=[]) => {
  //   terms = Array.isArray(terms) ? terms : (terms===undefined ? [] : [terms])
  //   usage = Array.isArray(usage) ? usage : (usage===undefined ? [] : [usage])

  //   try {
  //     await this.db.doc(NAME, id).update({
  //       search: arrayUnion(...terms.map(t => String(t))),
  //       usage: arrayUnion(...usage.map(t => String(t))),
  //       updatedAt: Date.now()
  //     })  
  //   } catch (e) {}
  // }

  /**
   * Given a regular document, that has media and tags,
   * 1. Run over media images
   *  1.1. Extract name and tags values
   *  1.2. update the image data
   * 
   * This procedure will not await and will fail silently
   * @param {Transaction} t collection handle
   * @param {string} collection collection handle
   * @param {string} id of doc
   * @param {{ media: string[]}} data any doc with media
   */
  reportSearchAndUsageFromRegularDocT = async (t, collection, id, data) => {

    data?.media?.forEach(
      async (m) => {
        // we do not await, we are willing to fail
        try {
          const name = url2name(m)
          let [exists, _, img] = await this.get(name)
          img = img ?? {
            handle: name,
            name,
            url: m,
            search: [],
            usage: []
          }
          img.search = union_array(
            img.search ?? [], 
            [id, ...extract_search_terms_from_regular_doc(data)]
          )
          img.usage = union_array(
            img.usage ?? [], 
            [`${collection}/${id}`]
          )
          img.updatedAt = Date.now()
          
          await this.db.doc(NAME, img.handle).set(img)
        } catch (e) {
          console.log(e)
        }
      }
    )
  }

  reportSearchAndUsageFromRegularDoc = async (collection, id, data) => {
    data?.media?.forEach(
      async (m) => {
        // we do not await, we are willing to fail
        try {
          const name = url2name(m)
          let [exists, _, img] = await this.get(name)
          img = img ?? {
            handle: name,
            name,
            url: m,
            search: [],
            usage: []
          }
          img.search = union_array(
            img.search ?? [], 
            [id, ...extract_search_terms_from_regular_doc(data)]
          )
          img.usage = union_array(
            img.usage ?? [], 
            [`${collection}/${id}`]
          )
          img.updatedAt = Date.now()
          
          await this.db.doc(NAME, img.handle).set(img)
        } catch (e) {
          console.log(e)
        }
      }
    )
  }

  /**
   * @param {string} id 
   * @param {ImageData} data
   * @returns {Promise<[id: string, data: ImageData]>}
   */
  set = async (id, data) => {
    data = { 
      ...data, 
      updatedAt: Date.now(), 
      search: create_search_index(data), 
    }
    await this.db.doc(NAME, id).set(data)
    return [id, data]
  }

  /**
   * @param {DiscountData} data 
   * @returns {Promise<[id: string, data: ImageData]>}
   */
  create = async (data) => {      
    return this.set(
      data.handle, {
        ...data, 
        usage: [], 
        usage_count: 0,
        updatedAt: Date.now(), 
        createdAt: Date.now()
      }
    )
  }

  /** 
   * @param {string} id
   **/
  delete = async (id) => {
    const [exists, _, data] = await this.get(id)
    if(!exists)
      return;

    // 1. look at ref
    // - if this is missing, do nothing
    // - if this is gs://, use google storage for delete
    // - if this is s3, locate the correct setting and delete it
    // 2. remove url from usages
    // 3. remove image from database - this.db.col(NAME).remove(id)
    const { url, ref, usage } = data

    if(ref) {
      try {
        // First, delete from object storage
        await this.context.storage.deleteByRef(ref)
      } catch(e) {
        console.log(e)
      }
    }

    if(usage) {
      // second remove usages
        usage.forEach(
          async u => {
            const parts = u.split('/')
            const doc = parts.pop()
            const col = parts.join('/')
            const urls = []
            if(url) urls.push(url)
            if(ref) urls.push(ref)
            if(urls.length==0)
            return;

            try {
              await this.db.doc(col, doc).update(
                {
                  media: arrayRemove(...urls)
                }
              )
            } catch(e) {
              console.log(e)
            }
          }
        )
    }

    // Lastly, remove the image document
    await this.db.col(NAME).remove(id)
  }

  /**
   * 
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, ImageData][]> | ()=>Promise<[string, ImageData][]>} a one promise or next handler iterator
   */
  list = (searchTokens=[], limit=100, from_cache=false, iterator=false) => {
    let q = { orderBy: [['updatedAt', 'desc']], limit }
    if (Array.isArray(searchTokens) && searchTokens.length)
      q.where = [ ['search', 'array-contains-any', searchTokens] ]

    return this.listWithQuery(q, from_cache, iterator)
  }

  /**
   * List with query, make sure you have database indexed for the query
   * 
   * @param {object} q { orderBy: [['field1', 'asc']], where: [['name', '=', 'tomer'], limit: 10] } 
   * @param {boolean} from_cache force cache if available
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[string, ImageData][]> | ()=>Promise<[string, ImageData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }

}