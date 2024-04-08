import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '../comps/fields-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, withCard, Handle } from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import StorefrontProducts from '@/admin/comps/storefront-products.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import { MdPublish } from 'react-icons/md/index.js'
import { getSDK } from '@/admin-sdk/index.js'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { SelectResourceWithTags } from '@/admin/comps/select-resource.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, withBling } from '@/admin/comps/common-ui.jsx'
import { DiscountApplicationEnum } from '@storecraft/core/v-api/types.api.enums.js'
import { useDocumentActions } from '../hooks/useDocumentActions.js'

const test = {
  title: 'storefront 1',
  handle: 'sf-main',
  desc : 'blah blah blah',
  products: [],
  collections : [],
  discounts: [],
  tags : [],
  updatedAt : 39203023,
  media : ['url1', 'url2'],
  notes : [ { msg : '', url:''} ]
}

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[34rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, 
      editable: true, desc: 'Give your store a title', 
      comp: withCard(withBling(MInput), {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: 'Handle',  type: 'text', validate: false, 
      editable: true, desc: 'An identifier for your store',
      comp: withCard(Handle, {className:'w-full h-fit'}),
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'products', name: 'Products', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which specific products are used by the Store Front',
      comp: withCard(StorefrontProducts, { className:'h-10' }),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'collections', name: 'Collections', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which collections meta data is used by the Store Front',
      comp: withCard(SelectResourceWithTags, 
        { 
          className:'w-full', add_all: true, resource: 'collections',
          /**
           * @param {import('@storecraft/core/v-api').CollectionType} it 
           */
          name_fn: it => it.title, slug: '/pages/collections'

        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'discounts', name: 'Discounts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which discounts are used by the Store Front',
      comp: withCard(SelectResourceWithTags, 
        { 
          className: 'w-full', add_all: true, resource: 'discounts',
          /**
           * @param {import('@storecraft/core/v-api').DiscountType[]} w 
           */
          transform_fn: (w) => w.filter(
            it => it.application.id===DiscountApplicationEnum.Auto.id && it.active
          ), slug: '/pages/discounts'
        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'shipping_methods', name: 'Shipping Methods', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which Shipping methods are used by the Store Front',
      comp: withCard(SelectResourceWithTags, 
        { 
          className: 'w-full', add_all: true, resource: 'shipping',
          /**
           * @param {import('@storecraft/core/v-api').ShippingMethodType} it 
           */
          name_fn: it => it.title, slug: '/pages/shipping-methods'
        }
      ),  
      comp_params: { className: 'w-full h-fit' } 
    },
    {
      key: 'posts', name: 'Posts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which Notes / Posts are used by the Store Front',
      comp: withCard(SelectResourceWithTags, 
        { 
          className: 'w-full', add_all: true, resource: 'posts',
          /**
           * @param {import('@storecraft/core/v-api').PostType} it 
           */
          name_fn: it => it.title, slug: '/pages/posts'
        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'desc', name: 'Description', type: 'text', 
      validate: false, editable: true, 
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: 'Media', type: 'text', validate: false, 
      editable: true, desc: 'Manage and edit your media files',
      comp: withCard(Media), comp_params: {className: 'w-full '} 
    },
    {
      key: 'video', name: 'Video', type: 'text', validate: false, 
      editable: true, desc: 'Add a video url to your store front',
      comp: withCard(withBling(MInput), {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
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
      key: 'tags', name: 'Tags', type: 'compund', validate: false, 
      editable: true, 
      desc: 'Tags help you attach extra attributes to your store',
      comp: withCard(TagsEdit) 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:`w-full --max-w-[35rem] --bg-red-100 items-center 
              lg:max-w-max lg:items-start lg:w-fit flex flex-col 
              lg:flex-row gap-5 mx-auto`},
  fields: [
    root_left_schema, root_right_schema
  ]
}

const Actions = (
  { 
    onClickSave=undefined, onClickCreate=undefined, 
    onClickDelete=undefined, onClickPublish=undefined,
    onClickDuplicate=undefined, onClickReload,
    id, className 
  }
) => {

  return (
  <RegularDocumentActions 
      id={id} className={className}
      onClickCreate={onClickCreate} 
      onClickDelete={onClickDelete}
      onClickDuplicate={onClickDuplicate}
      onClickReload={onClickReload}
      onClickSave={onClickSave}>
    <PromisableLoadingBlingButton 
        Icon={<MdPublish/>} text='publish' 
        show={Boolean(onClickPublish)}
        onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * 
 * @typedef {object} State Intrinsic state of `post`
 * @property {import('@storecraft/core/v-api').StorefrontType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
* } Context Public `post` context
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
    *  import('@storecraft/core/v-api').StorefrontType>
    * } 
    */
  const {
    actions: {
      savePromise, deletePromise, reload, duplicate,
      setError
    },
    context, key, 
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'storefronts', documentId, '/pages/storefronts', mode, base
  );

  const publishPromise = useCallback(
    async () => {
      await savePromise();
      const sf = await reload();
      setError(undefined)
      try {
        await getSDK().storefronts.publish(sf);
        await reload();
      } catch (e) {
        setError({ 
          error: {
            messages: [
              {
                message: e.toString()
              }
            ]
          }
        })
      }
    }, [savePromise, reload]
  );
  
  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['storefronts', documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={'storefronts'}/>                     
  <Actions 
      id={doc?.handle} className='mt-5'
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickPublish={!isCreateMode ? publishPromise : undefined}
      onClickDuplicate={!isCreateMode ? duplicate : undefined}
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} />
  <CreateDate 
      changes_made={hasChanged} ref={ref_head}  
      key={doc?.updated_at}
      time={doc?.created_at} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem]  lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage 
          error={error} 
          className='w-full' />
      <FieldsView 
          key={key} ref={ref_root} field={root_schema} 
          value={ doc ?? {} } isViewMode={isViewMode} 
          context={context}
          className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}