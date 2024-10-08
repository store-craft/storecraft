import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view.jsx'
import ShowIf from '@/comps/show-if.jsx'
import MDEditor from '@/comps/md-editor.jsx'
import Media from '@/comps/media.jsx'
import { MInput, withCard, 
  InputWithClipboard, Handle,
  Switch} from '@/comps/common-fields.jsx'
import TagsEdit from '@/comps/tags-edit.jsx'
import { SelectResourceWithTags } from '@/comps/select-resource.jsx'
import DocumentTitle from '@/comps/document-title.jsx'
import { RegularDocumentActions } from '@/comps/document-actions.jsx'
import ErrorMessage from '@/comps/error-message.jsx'
import DocumentDetails from '@/comps/document-details.jsx'
import Attributes from '@/comps/attributes.jsx'
import RelatedProducts from '@/comps/product-related-products.jsx'
import { JsonViewCard } from '@/comps/json.jsx'
import { CreateDate, Div, withBling } from '@/comps/common-ui.jsx'
import ProductVariants from '@/comps/products-variants.jsx'
import { useDocumentActions } from '../hooks/useDocumentActions.js'
import ProductDiscounts from '../comps/product-discounts.jsx'

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
      key: 'discounts', name: '🎁 Eligible Discounts',
      desc: 'The following discounts may be applied to this product',
      comp: withCard(
        ProductDiscounts, { className:'' }, true, false
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, 
      editable: true, desc: 'Give an accurate title of the product',
      comp: withCard(
        withBling(MInput), { className:'h-10' }, true, true
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: '🔗 Handle',  type: 'text', validate: false, 
      editable: true, 
      comp: withCard(Handle, {className:'w-full h-fit'}),
      desc: 'Product handle uniquely identifies the product. \n\
      Will be computed automatically if not filled by the product title',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'isbn', name: 'ISBN 𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃', type: 'text', validate: false, 
      editable: true, 
      comp: withCard(InputWithClipboard),  
      desc : 'Set ISBN identifier',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'variants_options',  name: 'Product Variants', validate: false, 
      editable: true, 
      comp: withCard(ProductVariants, {className:'w-full h-fit'}),
      desc: 'Product variants represent children product, that \
      varies with options, such as SIZE / COLOR for a shirt',
      comp_params: { className: 'w-full h-fit' } 
    },
    { 
      key: 'description', name: '📝 Description', type: 'text', 
      validate: false, editable: true, 
      desc: 'Further describe the product you are selling',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: '📀 Media', type: 'text',   
      validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'video', name: '🎥 Video', type: 'text', validate: false, 
      editable: true, 
      comp: withCard(InputWithClipboard),  
      desc : 'Add a video, that demonstrates the product',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'price', name: '🏷️ Price', type: 'number', validate: true, 
      editable: true, 
      comp: withCard(
        withBling(MInput), {className:'h-10', type: 'number'}
      ),  
      desc: 'How much will you sell the product for ?',
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'compare_at_price', name: 'Compare At Price', 
      type: 'number', validate: false, editable: true, 
      desc : 'Compare at price reveals the \
      competitiveness of your price',
      comp: withCard(
        withBling(MInput), { className:'h-10', type: 'number' }
      ),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'qty', name: '📦 Quantity', type: 'number', validate: true, 
      editable: true, 
      desc: 'How many units you have in stock for that product',
      comp: withCard(
        withBling(MInput), 
        { className:'h-10', type: 'number', min: '0', step: '1' }
      ),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
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
      desc : 'activate or deactivate the product (It won\'t\
       be published in a collection)', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'related_products', name: 'Related Products', 
      type: 'compund', validate: false, editable: true, 
      desc: 'Which other products are similar ? Offer your \
      customers similar products',
      comp: withCard(RelatedProducts) 
    },
    { 
      key: 'tags', name: '# Tags', type: 'compund',  validate: false, 
      editable: true, 
      desc: 'Tags help you attach attributes to products',
      comp: withCard(TagsEdit),
    },
    { 
      key: 'collections', name: '🗂️ Collections', type: 'compund', 
      validate: false, editable: true, 
      desc: 'Which collections does this product belong to ?',
      comp: withCard(
        SelectResourceWithTags, { 
          resource: 'collections', slug: '/pages/collections'
        }
      ) 
    },
  ]
}

const root_schema = {
  name:'Root', comp: Div, 
  comp_params : { 
    className: 'w-full --max-w-[35rem] --bg-red-100 items-center \
                lg:max-w-max lg:items-start lg:w-fit flex flex-col \
                lg:flex-row gap-5 mx-auto'
  },
  fields: [
    root_left_schema, root_right_schema
  ]
}

/**
 * 
 * @typedef {object} State Intrinsic state of `product`
 * @property {import('@storecraft/core/api').ProductType | 
 *  import('@storecraft/core/api').VariantType} data
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


/**
 * @param {{ 
 *  mode: import('../hooks/useDocumentActions.js').DocumentActionsMode 
 * }} params
 */
export default (
  { 
    mode, ...rest
  }
) => {

  const { id : documentId, base } = useParams();

  /** 
   * @type {import('../hooks/useDocumentActions.js').HookReturnType<
   *  import('@storecraft/core/api').ProductType &
   *  import('@storecraft/core/api').VariantType>
   * } 
   */
  const {
    actions: {
      savePromise, deletePromise, duplicate, reload
    },
    context: context_base, key, sdk,
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'products', documentId, '/pages/products', mode, base
  );

  const duplicate_mod = useCallback(
    () => {
      return duplicate(
        {
          discounts: undefined,
          title: doc?.title + ' duplicate'
        }
      )
    }, [doc, duplicate]
  );
  
  /** @type {Context} */
  const context = useMemo(
    () => (
      {
        ...context_base,
        getState: () => {
          const state = context_base.getState();
          console.log('state', state)
          delete state?.['variants'];
          return {
            data: state.data,
            hasChanged: state.hasChanged
          }
        },
        removeVariant: async (product_variant_handle) => {
          await sdk.products.remove(
            product_variant_handle
          );
          // reload, because deleting a variant child has a
          // side effect on parent
          await reload();
        },
        // pre create variant hook
        preCreateVariant: async () => {
          const variants_options = ref_root.current.get(false)?.data?.variants_options;
          await sdk.products.upsert(
            // @ts-ignore
            {
              ...doc,
              variants_options
            }
          )
        }

      }
    ), [doc, reload, context_base]
  );

  const isVariant = Boolean(doc?.parent_handle)
  let minor = [documentId ?? 'create']
  if(isVariant)
    minor = [doc?.parent_handle, 'variants', ...minor]

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['products', ...minor]} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={'products'}/>                     
  <RegularDocumentActions             
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      onClickDuplicate={!isCreateMode ? duplicate_mod : undefined}
      onClickReload={!isCreateMode ? (() => reload(false)) : undefined}
      id={documentId}
      className='mt-5'/>
  <CreateDate 
      ref={ref_head} time={doc?.created_at} 
      key={doc?.updated_at} className='mt-8' 
      changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage error={error} className='w-full' />
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