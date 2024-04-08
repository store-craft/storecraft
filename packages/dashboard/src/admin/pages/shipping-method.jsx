import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, withCard, Switch } from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import { MdPublish } from 'react-icons/md/index.js'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, HR, withBling } from '@/admin/comps/common-ui.jsx'
import { useDocumentActions } from '../hooks/useDocumentActions.js'

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
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'desc', name: 'Description', type: 'text', 
      validate: false, editable: true, desc: 'Optional description',
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    },
    {
      key: 'media', name: 'Media', type: 'text',   
      validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media), comp_params: {className: 'w-full'} 
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
      key: 'price', name: 'Price', type: 'number',  validate: true, 
      editable: true, desc: 'The price of the shipping method', 
      comp: withCard(
        withBling(MInput), { className:'h-10', min: '0', type: 'number' }
      ),  
      comp_params: {className: 'w-full h-fit'} 
    },
    {
      key: 'tags', name: 'Tags', type: 'compund', validate: false, 
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
    <PromisableLoadingBlingButton 
        Icon={MdPublish} text='publish' 
        show={Boolean(onClickPublish)}
        onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * 
 * @typedef {object} State Intrinsic state of `shipping`
 * @property {import('@storecraft/core/v-api').ShippingMethodType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
* } Context Public `shipping` context
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
    *  import('@storecraft/core/v-api').ShippingMethodType>
    * } 
    */
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

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['shipping', documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={'shipping'}/>                     
  <Actions 
      id={doc?.handle} className='mt-5'
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickDuplicate={!isCreateMode ? duplicate : undefined}
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