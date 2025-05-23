import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view'
import ShowIf from '@/comps/show-if'
import MDEditor from '@/comps/md-editor'
import Media from '@/comps/media'
import { MInput, withCard, Switch } from '@/comps/common-fields'
import TagsEdit from '@/comps/tags-edit'
import DocumentTitle from '@/comps/document-title'
import ErrorMessage from '@/comps/error-message'
import DocumentDetails from '@/comps/document-details'
import { RegularDocumentActions } from '@/comps/document-actions'
import Attributes from '@/comps/attributes'
import { JsonViewCard } from '@/comps/json'
import { CreateDate, Div, HR, withBling } from '@/comps/common-ui'
import { DocumentActionsMode, useDocumentActions } from '@/hooks/use-document-actions'
import { useCallback } from 'react'
import { ShippingMethodType } from '@storecraft/core/api'
import { BaseDocumentContext } from '.'

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, 
      editable: true, desc: 'The name of the shipping method', 
      comp: withCard(withBling(MInput), {className:'h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'description', name: '📝 Description', type: 'text', 
      validate: false, editable: true, desc: 'Optional description',
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    }, 
    {
      key: 'media', name: '🎬 Media', type: 'text',   
      validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media), comp_params: {className: 'w-full'} 
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
      desc : 'activate or deactivate the shipping method', 
      editable: true, defaultValue: true,
      comp: withCard(Switch, { className : 'text-gray-600'}, true),
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'price', name: '🏷️ Price', type: 'number',  validate: true, 
      editable: true, desc: 'The price of the shipping method', 
      comp: withCard(
        withBling(MInput), { className:'h-10', min: '0', type: 'number' }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'tags', name: '# Tags', type: 'compund', validate: false, 
      editable: true, 
      desc: 'Tags help you attach extra attributes to your methods',
      comp: withCard(TagsEdit) 
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

const Actions = ({ onClickSave=undefined, onClickCreate=undefined, 
                   onClickDelete=undefined, onClickPublish=undefined,
                   onClickDuplicate=undefined, onClickReload,
                   id, className }) => {
  return (
  <RegularDocumentActions 
      id={id} className={className}
      onClickCreate={onClickCreate} 
      onClickDelete={onClickDelete}
      onClickDuplicate={onClickDuplicate}
      onClickReload={onClickReload}
      onClickSave={onClickSave}>
  </RegularDocumentActions>  
  )
}

/**
 * Intrinsic state of `shipping`
 */
export type State = {
  data: ShippingMethodType;
  hasChanged: boolean;
};
/**
 * Public `shipping` context
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
      savePromise, deletePromise, reload, duplicate,
    },
    context, key, 
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, 
  } = useDocumentActions(
    'shipping', documentId, '/pages/shipping-methods', mode, base
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

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['shipping', documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={'shipping'}/>                     
  <Actions 
    id={doc?.handle} className='mt-5'
    onClickSave={isEditMode ? savePromise : undefined}
    onClickCreate={isCreateMode ? savePromise : undefined}
    onClickDuplicate={!isCreateMode ? duplicate_mod : undefined}
    onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
    onClickDelete={!isCreateMode ? deletePromise : undefined} />
  <CreateDate 
    changes_made={hasChanged} ref={ref_head}  
    key={doc?.updated_at}
    time={doc?.created_at} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem]  lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage error={error} className='w-full' />
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