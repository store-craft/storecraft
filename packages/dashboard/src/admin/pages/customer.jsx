import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { MInput, withCard } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, HR, withBling } from '@/admin/comps/common-ui.jsx'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'
// import { UserData } from '@/admin-sdk/js-docs-types'

const left = {
  comp: Div, 
  comp_params: { className:'w-full gap-5 items-center lg:items-start lg:w-[35rem] flex flex-col '},
  fields : [
    { 
      key: 'firstname', name: 'First Name', type: 'text', validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'lastname', name: 'Last Name', type: 'text',  validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'email', name: 'Email', type: 'email', validate: true, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'phone_number', name: 'Phone number', type: 'text', validate: false, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'uid', name: 'UID', type: 'text', validate: true, editable: true, 
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
  key: 'address', name: 'Address', comp: withCard(Div, { className: 'flex flex-col gap-5'}), 
  desc: 'Address information of your user',
  comp_params: {className: 'w-full h-fit '},
  fields : [
    { 
      key: 'street1',  name: 'Street 1', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full', placeholder: ''}, false),
      comp_params: {className: 'text-gray-500'}
    },
    { 
      key: 'street2',  name: 'Street 2', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full', placeholder: ''}, false),
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
      key: 'tags', name: 'Tags', type: 'compund', validate: false, editable: true, 
      comp: withCard(TagsEdit), desc: 'Add tags to your users to better categorize them',
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

const data = [
  { firstname: 'Tomer', lastname: 'Shalev', email: 'tsdsd@t.com', uid: 1 },
  { firstname: 'Daniel', lastname: 'Vaknin', email: 't@t.com', uid: 2 },
  { firstname: 'Rinat', lastname: 'Vaknin Shalev', email: 't@t.com' , uid: 3 },
  { firstname: 'Dalhya', lastname: 'Shalev', email: 't@t.com' , uid: 4 },
]

/**
 * @typedef {object} State
 * @property {UserData} data
 * @property {boolean} hasChanged
 */

export default ({ collectionId, 
                  mode, segment, ...rest}) => {

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

  /**@type {UserData} */
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

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)
    
  const context = useMemo(
    () => ({
      /** @returns {State} */
      getState: () => {
        const data = ref_root.current.get(false)?.data
        const hasChanged = Boolean(ref_head.current.get())
        return {
          data, hasChanged
        }
      }
    }), []
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
        },
        hasChanged: false
      }
      ref_head.current.set(false)
      navWithState(`/pages/${segment}/create`, 
            state, state_next)
    }, [navWithState, segment, context]
  )

  const savePromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await set(final)
      nav(`/pages/${segment}/${id}/edit`, { replace: true })
    }, [set, doc, nav, segment]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/pages/${segment}/${id}/edit`, { replace: true })
    }, [create, doc, nav, segment]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/pages/${segment}`, { replace: true })
    }, [deleteDocument, nav, segment]
  )

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['customers', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <RegularDocumentActions id={docId}
             onClickSave={isEditMode ? savePromise : undefined}
             onClickCreate={isCreateMode ? createPromise : undefined}
             onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
             onClickDelete={!isCreateMode ? deleteDocument : undefined} 
             className='mt-5'/>
  <CreateDate ref={ref_head} time={doc?.createdAt} 
              key={doc?.updatedAt} className='mt-8' 
              changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} className='mt-8'>
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} classname='w-full' />
      <FieldsView key={key} ref={ref_root} field={root_schema} 
                  value={ doc ?? {} } 
                  context={context}
                  isViewMode={isViewMode} className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}
