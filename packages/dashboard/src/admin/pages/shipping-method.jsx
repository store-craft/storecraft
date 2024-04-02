import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, Div, withCard, Switch } from '@/admin/comps/common-fields.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import { MdPublish } from 'react-icons/md/index.js'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, HR, withBling } from '@/admin/comps/common-ui.jsx'
import { decode, encode } from '@/admin/utils/index.js'
// import { ShippingData } from '@/admin-sdk/js-docs-types'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'name', name: 'Name', type: 'text',  validate: true, 
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
      validate: false, editable: true, desc: 'Manage and edit your media files',
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
      comp: withCard(withBling(MInput), { className:'h-10', min: '0', type: 'number' }),  
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
 * @typedef {object} State
 * @property {ShippingData} data
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

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)

  /**@type {OrderData} */
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

  const context = useMemo(
    () => ({
      /**@returns {State} */
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
          id: undefined
        },
        hasChanged: false
      }
      // ref_head.current.set(false)
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
  <DocumentTitle major={[collectionId, documentId ?? 'create']} className='' />   
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <Actions id={docId} className='mt-5'
           onClickSave={isEditMode ? savePromise : undefined}
           onClickCreate={isCreateMode ? createPromise : undefined}
           onClickDuplicate={!isCreateMode ? duplicate : undefined}
           onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
           onClickDelete={!isCreateMode ? deletePromise : undefined} />
  <CreateDate changes_made={hasChanged} ref={ref_head}  
              key={doc?.updatedAt}
              time={doc?.createdAt} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode}>
    <div className='w-full max-w-[40rem]  lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} className='w-full' />
      <FieldsView key={key} ref={ref_root} field={root_schema} 
                  value={ doc ?? {} } isViewMode={isViewMode} 
                  context={context}
                  className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}