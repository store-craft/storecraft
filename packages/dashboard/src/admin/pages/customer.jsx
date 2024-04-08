import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { MInput, withCard } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, HR, withBling } from '@/admin/comps/common-ui.jsx'
import { useDocumentActions } from '../hooks/useDocumentActions.js'

const left = {
  comp: Div, 
  comp_params: { 
    className: 'w-full gap-5 items-center lg:items-start \
    lg:w-[35rem] flex flex-col '
  },
  fields : [
    { 
      key: 'firstname', name: 'First Name', type: 'text', 
      validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'lastname', name: 'Last Name', type: 'text', 
      validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'email', name: 'Email', type: 'email', 
      validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'phone_number', name: 'Phone number', type: 'text', 
      validate: false, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'auth_id', name: 'UID', type: 'text', 
      validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      desc: 'The authentication platform user id', 
      comp_params: {className: 'w-full h-fit'} 
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

const fields_address = {
  key: 'address', name: 'Address', 
  comp: withCard(Div, { className: 'flex flex-col gap-5'}), 
  desc: 'Address information of your user',
  comp_params: {className: 'w-full h-fit '},
  fields : [
    { 
      key: 'street1',  name: 'Street 1', type: 'text', validate: false, 
      comp: withCard(
        withBling(MInput), 
        { className : 'h-10 w-full', placeholder: ''}, 
        false
      ),
      comp_params: { className: 'text-gray-500' }
    },
    { 
      key: 'street2',  name: 'Street 2', type: 'text', validate: false, 
      comp: withCard(
        withBling(MInput), 
        { className : 'h-10 w-full', placeholder: ''}, 
        false
      ),
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'city',  name: 'City', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false),
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'country',  name: 'Country', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false), 
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'state',  name: 'State', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false), 
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'zip_code',  name: 'Zip Code', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false),
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'postal_code',  name: 'Postal Code', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false),
      comp_params: {className: 'text-gray-500'}
    },
  ]
}

const right = {
  name: 'right', comp: Div, 
  comp_params: {className: 'w-full lg:w-[19rem] h-fit flex flex-col gap-5'},
  fields : [
    {
      key: 'tags', name: 'Tags', type: 'compund', 
      validate: false, editable: true, 
      comp: withCard(TagsEdit), desc: 'Add tags to your users to \
      better categorize them',
      comp_params: {className: 'w-full  '} 
    },
    fields_address,
  ]
}

const root_schema = {
  name:'Root', comp: Div, 
  comp_params : {className:'w-full gap-5 lg:justify-center mx-auto \
                            lg:w-fit flex flex-col justify-start lg:flex-row '},
  fields : [left, right]
}

/**
 * 
 * @typedef {object} State Intrinsic state of `tag`
 * @property {import('@storecraft/core/v-api').CustomerType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
* } Context Public `tag` context
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
  *  import('@storecraft/core/v-api').CustomerType>
  * } 
  */
 const {
   actions: {
     savePromise, deletePromise, reload,
   },
   context, key, 
   doc, isCreateMode, isEditMode, isViewMode, 
   loading, hasChanged, hasLoaded, error,
   ref_head, ref_root, 
 } = useDocumentActions(
   'customers', documentId, '/pages/customers', mode, base
 );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['customers', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={'customers'}/>                     
  <RegularDocumentActions 
      id={doc?.id}
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      className='mt-5'/>
  <CreateDate 
      ref={ref_head} time={doc?.created_at} 
      key={doc?.updated_at} className='mt-8' 
      changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <ErrorMessage error={error} className='w-full' />
      <FieldsView 
          key={key} ref={ref_root} field={root_schema} 
          value={ doc ?? {} } 
          context={context}
          isViewMode={isViewMode} 
          className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}
