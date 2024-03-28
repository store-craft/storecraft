import { useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '../comps/fields-view'
import { useCommonApiDocument } from '../../shelf-cms-react-hooks'
import ShowIf from '../comps/show-if'
import MDEditor from '../comps/md-editor'
import Media from '../comps/media'
import { 
  MInput, Div, withCard, 
  InputWithClipboard, 
  Handle,
  Switch} from '../comps/common-fields'
import TagsEdit from '../comps/tags-edit'
import ChooseCollections from '../comps/choose-collections'
import DocumentTitle from '../comps/document-title'
import { RegularDocumentActions } from '../comps/document-actions'
import EditMessage from '../comps/edit-message'
import DocumentDetails from '../comps/document-details'
import Attributes from '../comps/attributes'
import RelatedProducts from '../comps/product-related-products'
import { JsonViewCard } from '../comps/json'
import { CreateDate, HR, withBling } from '../comps/common-ui'
import ProductVariants from '../comps/products-variants'
import { decode, encode } from '../utils'
import { ProductData } from '../../admin-sdk/js-docs-types'
import useNavigateWithState from '../hooks/useNavigateWithState'
import { getShelf } from '../../admin-sdk'

const test = {
  title: 'call of duty',
  handle: 'call-of-duty-wii-perfect',
  desc : 'blah blah blah',
  price: 50,
  qty: 1,
  updatedAt : 39203023,
  collections: ['ps2-games', 'favorites'],
  tags : ['console_ps2', 'genre_action', 'region_ntsc'],
  search: ['t1', 't2', 't3'],
  media : ['url1', 'url2']
}

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, editable: true, 
      desc: 'Give an accurate title of the product',
      comp: withCard(withBling(MInput), { className:'h-10' }, true, true),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: 'Handle',  type: 'text', validate: false, editable: true, 
      comp: withCard(Handle, {className:'w-full h-fit'}),
      desc: 'Product handle uniquely identifies the product. \nWill be computed automatically if not filled by the product title',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'isbn', name: 'ISBN', type: 'text', validate: false, editable: true, 
      comp: withCard(InputWithClipboard),  
      desc : 'Set ISBN identifier',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'variants_options',  name: 'Product Variants', validate: false, editable: true, 
      comp: withCard(ProductVariants, {className:'w-full h-fit'}),
      desc: 'Product variants represent children product, that varies with options, such as SIZE / COLOR for a shirt',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'desc', name: 'Description', type: 'text', 
      validate: false, editable: true, desc: 'Further describe the product you are selling',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: 'Media', type: 'text',   
      validate: false, editable: true, desc: 'Manage and edit your media files',
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'video', name: 'Video', type: 'text', validate: false, editable: true, 
      comp: withCard(InputWithClipboard),  
      desc : 'Add a video, that demonstrates the product',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'price', name: 'Price', type: 'number', validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className:'h-10', type: 'number'}),  
      desc: 'How much will you sell the product for ?',
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'compareAtPrice', name: 'Compare At Price', type: 'number',   
      validate: false, editable: true, desc : 'Compare at price reveals the competitiveness of your price',
      comp: withCard(withBling(MInput), { className:'h-10', type: 'number' }),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'qty', name: 'Quantity', type: 'number', validate: true, editable: true, 
      desc: 'How many units you have in stock for that product',
      comp: withCard(withBling(MInput), {className:'h-10', type: 'number', min: '0', step: '1'}),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
    {
      name: 'JSON', type: 'compund', validate: false, editable: false, 
      desc: 'Observe the RAW data',
      comp: JsonViewCard,
      comp_params: { className: 'w-full' }
    },
  ]
}

const root_right_schema = {
  name:'Root2', comp: Div, 
  comp_params : { className:'w-full lg:w-[19rem] flex flex-col gap-5'},
  fields: [
    {
      key: 'active', name: 'Active', validate: true, 
      desc : 'activate or deactivate the product (It won\'t be published in a collection)', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'related_products', name: 'Related Products', type: 'compund',  validate: false, editable: true, 
      desc: 'Which other products are similar ? Offer your customers similar products',
      comp: withCard(RelatedProducts) 
    },
    { 
      key: 'tags', name: 'Tags', type: 'compund',  validate: false, editable: true, 
      desc: 'Tags help you attach attributes to products',
      comp: withCard(TagsEdit),
    },
    { 
      key: 'collections', name: 'Collections', type: 'compund',  validate: false, editable: true, 
      desc: 'Which collections does this product belong to ?',
      comp: withCard(ChooseCollections, {collectionId: 'collections'}) 
    },
    
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full --max-w-[35rem] --bg-red-100 items-center \
              lg:max-w-max lg:items-start lg:w-fit flex flex-col \
              lg:flex-row gap-5 mx-auto'},
  fields: [
    root_left_schema, root_right_schema
  ]
}

/**
 * @typedef {object} State
 * @property {ProductData} data
 * @property {boolean} hasChanged
 */

export default ({ collectionId, 
                  mode, ...rest}) => {

  const { id : documentId, base } = useParams()
  const ref_root = useRef()
  const { 
    doc: doc_original, loading, hasLoaded, error, op,
    actions: { 
      reload, set, create, deleteDocument, colId, docId 
    }
  } = useCommonApiDocument(collectionId, documentId)

  const { 
    nav, navWithState, state 
  } = useNavigateWithState()

  /**@type {ProductData} */
  const doc = useMemo(
    () => {
      let base_o = {}
      try {
        base_o = base ? decode(base) : {}
      } catch (e) {}
      const doc = { ...base_o, ...doc_original, ...state?.data }
      return doc
    }, [doc_original, base, state]
  )

  // console.log('doc_original', doc_original)
  // console.log('state.data', state?.data)
  // console.log('doc', doc)

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)
  const isVariant = Boolean(doc?.parent_handle)
    
  const context = useMemo(
    () => ({
      /** @returns {State} */
      getState: () => {
        const data = ref_root.current.get(false)?.data
        const hasChanged = Boolean(ref_head.current.get())
        return {
          data, hasChanged
        }
      },
      removeVariant: async (product_variant_handle) => {
        await getShelf().products.delete(
          product_variant_handle
        )
        // reload, because deleting a variant child has a
        // side effect on parent
        await reload()
      },
      preCreateVariant: async () => {
        const variants_options = ref_root.current.get(false)?.data?.variants_options
        await getShelf().products.update(
          doc.handle, 
          /**@type {ProductData} */
          {
            variants_options
          }
        )
      }

    }), [doc, reload]
  )

  const duplicate = useCallback(
    async () => {
      const state = context.getState()
      /**@type {State} */
      const state_next = { 
        data: { 
          ...state?.data,
          updatedAt: Date.now(),
          createdAt: undefined,
          search: undefined,
          handle: undefined
        },
        hasChanged: false
      }
      ref_head.current.set(false)
      navWithState(`/pages/${collectionId}/create`, 
            state, state_next)
    }, [navWithState, collectionId, context]
  )
  const savePromise = useCallback(
    async () => {
      // const doc = await reload()
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await set(final)
      nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
    }, [set, nav, doc, collectionId, reload]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
    }, [create, doc, nav, collectionId]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/pages/${collectionId}`, { replace: true })
    }, [deleteDocument, nav, collectionId]
  )

  let minor = [documentId ?? 'create']
  if(isVariant)
    minor = [doc?.parent_handle, 'variants', ...minor]

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={[collectionId, ...minor]} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <RegularDocumentActions             
             onClickSave={isEditMode ? savePromise : undefined}
             onClickCreate={isCreateMode ? createPromise : undefined}
             onClickDelete={!isCreateMode ? deletePromise : undefined} 
             onClickDuplicate={!isCreateMode ? duplicate : undefined}
             onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
             id={docId}
             className='mt-5'/>
  <CreateDate ref={ref_head} time={doc?.createdAt} 
              key={doc?.updatedAt} className='mt-8' 
              changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} className='mt-8'>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} classname='w-full' />
      <FieldsView ref={ref_root} 
                  key={key}
                  context={context}
                  field={root_schema} 
                  value={ doc ?? {} } 
                  isViewMode={isViewMode} className='mt-8' />      
    </div>
  </ShowIf>
</div>
  )
}