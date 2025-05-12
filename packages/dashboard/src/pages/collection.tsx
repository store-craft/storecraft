import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view'
import { PromisableLoadingBlingButton } from '@/comps/common-button'
import ShowIf from '@/comps/show-if'
import MDEditor from '@/comps/md-editor'
import Media from '@/comps/media'
import { MInput, withCard, 
  Handle, Switch } from '@/comps/common-fields'
import { MdPublish } from 'react-icons/md'
import DocumentTitle from '@/comps/document-title'
import CollectionProducts from '@/comps/collection-products'
import ErrorMessage from '@/comps/error-message'
import TagsEdit from '@/comps/tags-edit'
import DocumentDetails from '@/comps/document-details'
import { RegularDocumentActions } from '@/comps/document-actions'
import Attributes from '@/comps/attributes'
import BulkTagProductsInCollection from '@/comps/bulk-tag-products-in-collection'
import { JsonViewCard } from '@/comps/json'
import { CreateDate, Div, withBling } from '@/comps/common-ui'
import { useDocumentActions } from '@/hooks/use-document-actions'
import { CollectionType } from '@storecraft/core/api'
import { BaseDocumentContext } from '.'

const left = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full flex flex-col gap-5 max-w- lg:w-[35rem]'},
  fields: [
    {
      comp: CollectionProducts,
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, 
      editable: true, 
      desc: 'Give an efficient title to the collection, e.g. - Women shirts',
      comp: withCard(withBling(MInput), {className:'w-full h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: '🔗 Handle',  type: 'text',  
      validate: false, editable: true, 
      desc : 'A handle uniquely identifies the collection.\nWill be computed \
      automatically if not filled by the product title', 
      comp: withCard(Handle, {className:'w-full h-fit'}),
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'desc', name: '📝 Description', type: 'text', validate: false, 
      editable: true, 
      desc : 'Describe the collection for your customers',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'media', name: '🎥 Media', validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  
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

const right = {
  name:'Main', comp: Div, 
  comp_params : { 
    className:`w-full items-center lg:items-start lg:w-[18rem] 
               flex flex-col gap-5`
  },
  fields: [
    {
      key: 'active', name: 'Active', validate: true, 
      desc : 'activate or deactivate the collection', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'tags', name: '# Tags', type: 'compund', validate: false, 
      editable: true, 
      desc: 'Use tags to attach attributes to the collection',
      comp: withCard(TagsEdit),
      comp_params: {className: 'w-full  '}  
    },
    // {
    //   comp: BulkTagProductsInCollection,
    //   comp_params: {className: 'w-full'} 
    // },
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full gap-5 --justify-center --bg-red-100 items-center \
              lg:max-w-max lg:items-start lg:w-fit flex flex-col \
              lg:flex-row --mx-auto'},
  fields: [
    left, right
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
        Icon={<MdPublish />} 
        text='publish' 
        keep_text_on_load={true}
        show={Boolean(onClickPublish)}
        onClick={onClickPublish} 
        className='' />
  </RegularDocumentActions>  
  )
}

/**
 * Intrinsic state of `collection`
 */
export type State = {
    data: CollectionType;
    hasChanged: boolean;
};
/**
 * Public `collection` context
 */
export type Context = BaseDocumentContext<State>;


export default (
  { 
    mode, ...rest
  }: {
    mode: 'view' | 'edit' | 'create';
  }
) => {
                    
  const { id : documentId, base } = useParams();

  const {
    actions: {
      savePromise, deletePromise, setError, reload,
      navWithState, duplicate
    },
    context, key, sdk,
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'collections', documentId, '/pages/collections', mode, base
  );
  
  const duplicate_mod = useCallback(
    () => {
      return duplicate(
        {
          title: doc?.title + ' duplicate',
        }
      )
    }, [doc, duplicate]
  );

  const publishPromise = useCallback(
    async () => {
      await savePromise();
      setError(undefined)
      try {
        await sdk.collections.publish(documentId, 400);
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
    }, [documentId, savePromise, reload]
  );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['collections', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={'collections'} />                     
  <Actions 
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickPublish={!isCreateMode ? publishPromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      onClickDuplicate={!isCreateMode ? duplicate_mod : undefined}
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      id={documentId}
      className='mt-5'/>
  <CreateDate 
      changes_made={hasChanged} ref={ref_head}  
      key={doc?.updated_at}
      time={doc?.created_at} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >      
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage error={error} className='w-full' />
      <FieldsView 
        key={key} ref={ref_root} 
        field={root_schema} 
        context={context}
        value={ doc ?? {} } 
        isViewMode={isViewMode} className='mt-8' />      
      </div>                

  </ShowIf>   
</div>
  )
}