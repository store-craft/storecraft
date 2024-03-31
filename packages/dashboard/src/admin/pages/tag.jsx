import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { Div, MInput, withCard } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import TagValues, { values_validator } from '@/admin/comps/tag-values.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, withBling } from '@/admin/comps/common-ui.jsx'
// import { TagData } from '@/admin-sdk/js-docs-types'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

const root_schema = {
  name:'Root', comp: Div, comp_params: { className : 'flex flex-col gap-5 w-full max-w-[35rem]' },
  fields: [
    { 
      key: 'name',  name: 'Name', type: 'text', validate: true, 
      comp: withCard(withBling(MInput), {className: 'h-9', placeholder : 'enter the key / name of the tag' }), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'values',  name: 'Values', type: 'text', validate: true, validator: values_validator ,
      comp: withCard(TagValues), comp_params: {className: 'w-full  '} 
    },
    { 
      key: 'desc',     name: 'Description',      type: 'text', validate: false, editable: true, 
      desc : 'Describe the purpose of this tag',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    {
      name: 'JSON', type: 'compund', validate: false, editable: false, 
      desc: 'Observe the RAW data',
      comp: JsonViewCard,
      comp_params: { className: 'w-full' }
    },

  ]
}

/**
 * @typedef {object} State
 * @property {TagData} data
 * @property {boolean} hasChanged
 */

export default ({ collectionId, 
                  mode, ...rest}) => {

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

  /**@type {TagData} */
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
          name: undefined
        },
        hasChanged: false
      }
      ref_head.current.set(false)
      navWithState(`/pages/${collectionId}/create`, 
            state, state_next)
    }, [navWithState, collectionId, context]
  )

  const savePromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await set(final)
      nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
    }, [set, doc, nav, collectionId]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
    }, [create, doc, nav, collectionId]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/pages/${collectionId}`, { replace: true })
    }, [deleteDocument, nav, collectionId]
  )

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={[collectionId, documentId ?? 'create']} className='' />
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId}/>                     
  <RegularDocumentActions
             id={docId}
             onClickSave={isEditMode ? savePromise : undefined}
             onClickCreate={isCreateMode ? createPromise : undefined}
             onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
             onClickDelete={!isCreateMode ? deletePromise : undefined}
             className='mt-5'/>
  <CreateDate ref={ref_head} time={doc?.createdAt} 
              key={doc?.updatedAt} className='mt-8' 
              changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <EditMessage messages={error} classname='w-full max-w-[35rem] mx-auto' />
    <FieldsView key={key} ref={ref_root} field={root_schema} 
                value={ doc ?? {} } context={context}
                isViewMode={isViewMode} className='mx-auto' />      
  </ShowIf>
</div>
  )
}
