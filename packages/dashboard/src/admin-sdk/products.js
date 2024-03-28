// import { writeBatch, doc, arrayUnion, 
//          arrayRemove, 
//          deleteField,
//          runTransaction,
//          DocumentSnapshot,
//          Transaction} from 'firebase/firestore'
import { StorecraftAdminSDK } from '.'
import { assert, text2tokens, 
         to_handle, 
         union_array} from './common/utils/functional'
import { Handle, ImageData, ProductData, VariantCombination } from './js-docs-types'
import { url2name } from './images'

/**
 * @param {ProductData} data 
 * @returns {string[]}
 */
const create_search_index = (data) => {

  const tag_all = data.tags ?? []
  const tag_vs = tag_all.map(it => it.split('_').pop())
  const collections = data.collections ?? []
  const tag_all_prefixed = tag_all.map(t => `tag:${t}`)
  const collections_prefixed = collections.map(c => `col:${c}`)
  const extra = []
  if (data.price) extra.push(`price:${data.price.toString()}`)
  return [
          data.handle, 
          data.title.toLowerCase(), 
          ...text2tokens(data.title.toLowerCase()),
          ...tag_vs, ...tag_all, ...tag_all_prefixed, 
          ...collections, ...collections_prefixed, 
          ...extra
  ]
}

const NAME = 'products'

const isNumberValid = 
  (v, min=Number.NEGATIVE_INFINITY, max=Number.POSITIVE_INFINITY) => {
  return (typeof v === 'number') && (v >= min) && (v <= max)
}

/**
 * @param {ProductData} d 
 * @returns 
 */
const validate = async d => {
  const errors = []
  const warnings = []

  if(!d.title)
    errors.push('Product Name is mandatory')
  if(!d.desc)
    warnings.push('You didn\'t write a product description')
  if(!isNumberValid(d.price, 0)) {    
    errors.push('Price Should be a non-negative number')
  } else {
    if(isNumberValid(d.compareAtPrice, 0) && d.compareAtPrice < d.price)
      warnings.push('Compare at Price Should be bigger than price')
  }
  if(!isNumberValid(d.qty, 0)) {
    errors.push('Quantity Should be a non-negative number')
  }
  if(!d.collections || d.collections.length==0)
    warnings.push('This product does not belong to any collection')

  return {
    warnings, errors,
    hasWarnings : warnings.length>0,
    hasErrors : errors.length>0,
  }
}

export default class Products {

  /**
   * 
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  /**
   * @param {string} id 
   * @param {boolean} try_cache 
   * @returns {Promise<[exists: boolean, id: string, data: ProductData]>}
   */
  get = async (id, try_cache=true) => this.db.doc(NAME, id).get(try_cache)

  /**
   * NA
   * @param {string} id 
   * @param {ProductData} data 
   * @returns id
   */
  update = (id, data) => {
    return this.db.doc(NAME, id).update(data)
  }

  /**
   * @param {string} id 
   * @param {ProductData} data
   * @returns {Promise<[id: string, data: ProductData]>}
   */
  set2 = async (id, data) => {
    assert(
      id===data.handle,
      'The Handle of product cannot be changed'
    )
    const db = this.context.firebase.db
    const next_data = await this.db.specialization().setWithImagesTransaction(
      db,
      NAME, id, data, 
      /** @param {ProductData} x */
      async (t, x) => {
        try {
          // data validation
          const report = await validate(data)
          if(report.hasErrors)
            throw [...report.errors, ...report.warnings]
    
          // new data suggestion
          data = {...data}
          data.updatedAt = Date.now()
          data.search = create_search_index(data)
          data.price = parseFloat(data.price)
          data.qty = parseInt(data.qty)
    
          // update parent if we are variant
          if(data?.parent_handle) {
            const dd = { ...data }
            delete dd.search
            /**@type {VariantCombination} */
            const comb = {
              product: dd,
              selection: dd._variant_hint
            }
            t.update(
              doc(db, NAME, data.parent_handle),
              {
                [`variants_products.${dd.handle}`]: comb
              }
            )
          }
          return data
    
        } catch (e) {
          throw Array.isArray(e) ? e : [e]
        }
      }
    )
    console.log('next_data', next_data)
    // return data
    return [id, next_data]
  }

  /**
   * @param {string} id 
   * @param {ProductData} data
   * @returns {Promise<[id: string, data: ProductData]>}
   */
  set = async (id, data) => {
    assert(
      id===data.handle,
      'The Handle of product cannot be changed'
    )

    try {
      // data validation
      const report = await validate(data)
      if(report.hasErrors)
        throw [...report.errors, ...report.warnings]

      // new data suggestion
      data = {...data}
      data.updatedAt = Date.now()
      data.search = create_search_index(data)
      data.price = parseFloat(data.price)
      data.qty = parseInt(data.qty)

      // test for inconsistency
      // document may have changed during this time
      const [prev_exists, __, prev_data] = await this.get(id, false)
      if(prev_exists && prev_data) {
        if(prev_data.updatedAt && prev_data.updatedAt > data.updatedAt)
          throw 'This document was updated elsewhere, please hit the reload button'
      }

      // update parent if we are variant
      if(data?.parent_handle) {
        const dd = { ...data }
        delete dd.search
        /**@type {VariantCombination} */
        const comb = {
          product: dd,
          selection: dd._variant_hint
        }
        await this.update(
          data.parent_handle,
          {
            [`variants_products.${dd.handle}`]: comb
          }
        )
      }

      // media usage report
      this.context.images
          .reportSearchAndUsageFromRegularDoc(NAME, id, data)
    
    } catch (e) {
      throw Array.isArray(e) ? e : [e]
    }

    await this.db.doc(NAME, id).set(data)
    // return data
    return [id, data]
  }

  /**
   * @param {ProductData} data 
   * @returns {Promise<[id: string, data: ProductData]>}
   */
  create = async (data) => {
    data = {
      ...data,
      createdAt: Date.now(),
      handle: to_handle(data.handle) ?? to_handle(data.title)
    }

    assert(
      data.handle,
      'Handle could not be computed'
    )

    const [exists, _, __] = await this.get(data.handle)

    assert(
      !exists, 
      `handle ${data.handle} already exists !!`
    )

    return this.set(data.handle, data)
  }

  /**
   * @param {string} id 
   * @returns nada
   */
  delete = async (id) => {
    const [exists, _, product] = await this.get(id, false)
    if(!exists)
      return;

    const isVariant = Boolean(product.parent_handle)
    const batch = writeBatch(this.context.firebase.db)
    const ref = doc(this.context.firebase.db, 'products', id)

    if(isVariant) {
      const [parent_exists] = await this.get(
        product.parent_handle, false
      )
      
      if(parent_exists) {
        const ref_parent = doc(
          this.context.firebase.db, 'products', 
          product.parent_handle
        );
  
        // remove the variant reference embedding from it's parent
        batch.update(
          ref_parent,
          {
            [`variants_products.${id}`]: deleteField(),
            updatedAt: Date.now()
          }
        )
      }
    }
    else {
      // we are not a variant, but we might have variant children,
      // let's delete them
      Object.keys(product.variants_products ?? {}).forEach(
        h => {
          batch.delete(
            doc(this.context.firebase.db, 'products', h)
            )
        }
      )
    }

    // at last, let's delete ourselves
    batch.delete(
      ref
    )

    return batch.commit()
  }

  /**
   * 
   * @param {string} id 
   * @param {number} howmuch 
   * @returns 
   */
  changeStockOf = (id, howmuch) => {
    return this.db.doc(NAME, id).incrementField('qty', howmuch, 0)
  }

  /**
   * @todo change it to array of ids
   * @param {[string, ProductData][]} products array of tuples [[id, product_data],...]
   * @param {string} collectionId 
   */
  batchAddProductsToCollection = async (products, collectionId) => {
    try {
      // add collection tag to each product with batch write
      const batch = writeBatch(this.context.firebase.db)
      products.forEach(it => {
        const ref = doc(this.context.firebase.db, 'products', it[0])
        batch.update(ref, { 
          collections : arrayUnion(collectionId),
          search : arrayUnion(`col:${collectionId}`),
          updatedAt : Date.now()
        })
      })
      await batch.commit()
    } catch (e) {
      throw 'Products update failed: ' + String(e)
    }
  }

  /**
   * 
   * @param {string[]} products_Ids 
   * @param {string} collectionId 
   */
  batchRemoveProductsFromCollection = async (products_Ids, collectionId) => {
    try {
      // add collection tag to each product with batch write
      const batch = writeBatch(this.context.firebase.db)
      products_Ids.forEach(id => {
        const ref = doc(this.context.firebase.db, 'products', id)
        batch.update(ref, { 
          collections : arrayRemove(collectionId),
          search : arrayRemove(`col:${collectionId}`),
          updatedAt : Date.now()
        })
      })
      await batch.commit()
    } catch (e) {
      console.log(e);
      throw 'Products update failed: ' + String(e)
    }

  }

  /**
   * 
   * @param {string[]} searchTokens 
   * @param {number} limit 
   * @param {boolean} from_cache 
   * @param {boolean} iterator true will give you a next iterator function for pagination 
   * @returns {Promise<[id: string, product:ProductData][]> >} a one promise or next handler iterator
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
   * @returns {Promise<[string, ProductData][]> | ()=>Promise<[string, ProductData][]>} a one promise or next handler iterator
   */
  listWithQuery = async (q, from_cache=false, iterator=false) => {
    const next = await this.db.col(NAME).paginate2(q, from_cache)
    return iterator ? next : 
                      next()
  }
}