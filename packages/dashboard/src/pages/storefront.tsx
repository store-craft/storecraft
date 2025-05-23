import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view'
import ShowIf from '@/comps/show-if'
import MDEditor from '@/comps/md-editor'
import Media from '@/comps/media'
import { MInput, withCard, Handle, Switch } from '@/comps/common-fields'
import TagsEdit from '@/comps/tags-edit'
import DocumentTitle from '@/comps/document-title'
import ErrorMessage from '@/comps/error-message'
import StorefrontProducts from '@/comps/storefront-products'
import { PromisableLoadingBlingButton } from '@/comps/common-button'
import { MdPublish } from 'react-icons/md'
import DocumentDetails from '@/comps/document-details'
import { RegularDocumentActions } from '@/comps/document-actions'
import Attributes from '@/comps/attributes'
import { SelectResourceWithTags } from '@/comps/select-resource'
import { JsonViewCard } from '@/comps/json'
import { CreateDate, Div, withBling } from '@/comps/common-ui'
import { DiscountApplicationEnum } from '@storecraft/core/api/types.api.enums.js'
import { DocumentActionsMode, useDocumentActions } from '@/hooks/use-document-actions'
import { 
  StorefrontType 
} from '@storecraft/core/api'
import { BaseDocumentContext } from '.'

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
      key: 'handle',  name: '🔗 Handle',  type: 'text', validate: false, 
      editable: true, desc: 'An identifier for your store',
      comp: withCard(Handle, {className:'w-full h-fit'}),
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'products', name: '🛍️ Products', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which specific products are used by the Store Front',
      comp: withCard(StorefrontProducts, { }),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'collections', name: '🗂️ Collections', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which collections meta data is used by the Store Front',
      comp: withCard(SelectResourceWithTags<'collections'>, 
        { 
          className:'w-full', add_all: false, resource: 'collections',
          name_fn: it => it.title, slug: '/pages/collections'

        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'discounts', name: '🎟️ Discounts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which discounts are used by the Store Front',
      comp: withCard(SelectResourceWithTags<'discounts'>, 
        { 
          className: 'w-full', add_all: false, resource: 'discounts',
          transform_fn: (w) => w.filter(
            it => it.application.id===DiscountApplicationEnum.Auto.id && it.active
          ), slug: '/pages/discounts'
        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'shipping_methods', name: '🚚 Shipping Methods', type: 'text', 
      validate: false, editable: true, 
      desc: 'Decide which Shipping methods are used by the Store Front',
      comp: withCard(SelectResourceWithTags<'shipping'>, 
        { 
          className: 'w-full', add_all: false, resource: 'shipping',
          name_fn: it => it.title, slug: '/pages/shipping-methods'
        }
      ),  
      comp_params: { className: 'w-full h-fit' } 
    },
    {
      key: 'posts', name: '✍🏼 Posts', type: 'text', validate: false, 
      editable: true, desc: 'Decide which Notes / Posts are used by the Store Front',
      comp: withCard(SelectResourceWithTags<'posts'>, 
        { 
          className: 'w-full', add_all: false, resource: 'posts',
          name_fn: it => it.title, slug: '/pages/posts'
        }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'description', name: '📝 Description', type: 'text', 
      validate: false, editable: true, 
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: '🖼️ Media', type: 'text', validate: false, 
      editable: true, desc: 'Manage and edit your media files',
      comp: withCard(Media), comp_params: {className: 'w-full '} 
    },
    {
      key: 'video', name: '🎥 Video', type: 'text', validate: false, 
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
      key: 'active', name: 'Enable', validate: true, 
      desc : 'Enable or disable the discount', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'tags', name: '# Tags', type: 'compund', validate: false, 
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
        Icon={<MdPublish/>} 
        text='publish' 
        keep_text_on_load={true}
        show={Boolean(onClickPublish)}
        onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * Intrinsic state
 */
export type State = {
  data: StorefrontType;
  hasChanged: boolean;
};

/**
 * Public context
 */
export type Context = BaseDocumentContext<State>;

export default (
 { 
   mode, ...rest
 }: {
  mode: DocumentActionsMode
 }
) => {
                   
  const { id : documentId, base } = useParams();

  const {
    actions: {
      reloadPromise, savePromise, deletePromise, reload, duplicate,
      setError
    },
    context, key, sdk,
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'storefronts', documentId, '/pages/storefronts', mode, base
  );

  const duplicate_mod = useCallback(
    () => {
      return duplicate(
        {
          title: doc?.title + ' duplicate'
        }
      )
    }, [doc, duplicate]
  );

  const publishPromise = useCallback(
    async () => {
      await savePromise();
      setError(undefined)
      try {
        await sdk.storefronts.publish(documentId);
        await reload();
      } catch (e) {
        setError(
          { 
            messages: [
              {
                message: e.toString()
              }
            ]
          }
        )
      }
    }, [savePromise, reload, documentId]
  );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['storefronts', documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={'storefronts'}/>                     
  <Actions 
    id={doc?.handle ?? doc?.id} className='mt-5'
    onClickSave={isEditMode ? savePromise : undefined}
    onClickCreate={isCreateMode ? savePromise : undefined}
    onClickPublish={!isCreateMode ? publishPromise : undefined}
    onClickDuplicate={!isCreateMode ? duplicate_mod : undefined}
    onClickReload={!isCreateMode ? reloadPromise : undefined}
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