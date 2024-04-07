import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, withCard, 
  InputWithClipboard, Handle,
  Switch} from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import { SelectResourceWithTags } from '@/admin/comps/select-resource.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import RelatedProducts from '@/admin/comps/product-related-products.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, HR, withBling } from '@/admin/comps/common-ui.jsx'
import ProductVariants from '@/admin/comps/products-variants.jsx'
import { getSDK } from '@/admin-sdk/index.js'
import { useDocumentActions } from '../hooks/useDocumentActions.js'

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
      desc: 'Product handle uniquely identifies the product. \n\
      Will be computed automatically if not filled by the product title',
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
      desc: 'Product variants represent children product, that varies with options, \
      such as SIZE / COLOR for a shirt',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'description', name: 'Description', type: 'text', 
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
      key: 'compare_at_price', name: 'Compare At Price', type: 'number',   
      validate: false, editable: true, desc : 'Compare at price reveals the \
      competitiveness of your price',
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
      key: 'related_products', name: 'Related Products', type: 'compund',  
      validate: false, editable: true, 
      desc: 'Which other products are similar ? Offer your customers similar products',
      comp: withCard(RelatedProducts) 
    },
    { 
      key: 'tags', name: 'Tags', type: 'compund',  validate: false, 
      editable: true, 
      desc: 'Tags help you attach attributes to products',
      comp: withCard(TagsEdit),
    },
    { 
      key: 'collections', name: 'Collections', type: 'compund', 
      validate: false, editable: true, 
      desc: 'Which collections does this product belong to ?',
      comp: withCard(SelectResourceWithTags, { resource: 'collections' }) 
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
 * 
 * @typedef {object} State Intrinsic state of `product`
 * @property {import('@storecraft/core/v-api').ProductType | 
 *  import('@storecraft/core/v-api').VariantType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef {object} InnerProductContext Inner `product` context
 * @prop {(product_variant_handle: string) => Promise<void>} removeVariant
 * @prop {() => Promise<void>} preCreateVariant
 * 
 * 
 * @typedef {InnerProductContext & 
 *  import('./index.jsx').BaseDocumentContext<State>
 * } Context Public `product` context
 * 
 */


export default (
  { 
    mode, ...rest
  }
) => {

  const { id : documentId, base } = useParams();

  /** 
   * @type {import('../hooks/useDocumentActions.js').HookReturnType<
   *  import('@storecraft/core/v-api').ProductType &
   *  import('@storecraft/core/v-api').VariantType>
   * } 
   */
  const {
    context: context_base, createPromise, 
    savePromise, deletePromise, duplicate, reload,
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions('products', documentId, '/pages/products', mode, base);

  /** @type {Context} */
  const context = useMemo(
    () => ({
      ...context_base,
      removeVariant: async (product_variant_handle) => {
        await getSDK().products.delete(
          product_variant_handle
        )
        // reload, because deleting a variant child has a
        // side effect on parent
        await reload()
      },
      preCreateVariant: async () => {
        const variants_options = ref_root.current.get(false)?.data?.variants_options
        await getSDK().products.update(
          doc.handle, 
          /** @type {import('@storecraft/core/v-api').ProductType} */
          {
            variants_options
          }
        )
      }

    }), [doc, reload, context_base]
  );

  const isVariant = Boolean(doc?.parent_handle)
  let minor = [documentId ?? 'create']
  if(isVariant)
    minor = [doc?.parent_handle, 'variants', ...minor]

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['products', ...minor]} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={'products'}/>                     
  <RegularDocumentActions             
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? createPromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      onClickDuplicate={!isCreateMode ? duplicate : undefined}
      onClickReload={!isCreateMode ? (() => reload(false)) : undefined}
      id={documentId}
      className='mt-5'/>
  <CreateDate 
      ref={ref_head} time={doc?.created_at} 
      key={doc?.updated_at} className='mt-8' 
      changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} className='w-full' />
      <FieldsView 
          ref={ref_root} 
          key={key}
          context={context}
          field={root_schema} 
          value={ doc ?? {} } 
          isViewMode={isViewMode} 
          className='mt-8' />      
    </div>
  </ShowIf>
</div>
  )
}