import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { Div, MInput, withCard } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import Media from '@/admin/comps/media.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { withBling, HR, CreateDate } from '@/admin/comps/common-ui.jsx'
// import { PostData } from '@/admin-sdk/js-docs-types'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title',  name: 'Title', type: 'text', validate: true, 
      desc: 'A short title for the post',
      comp: withCard(withBling(MInput), {className: 'h-9', placeholder : 'enter a title' }), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'text', name: 'Post', type: 'text', validate: false, editable: true, 
      desc : 'Write your post with Markdown and HTML',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'media', name: 'Media', validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
  ]
}

const root_right_schema = {
  name:'Root2', comp: Div, 
  comp_params : { className:'w-full lg:w-[19rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'tags', name: 'Tags', type: 'compund',  validate: false, editable: true, 
      desc: 'Tags help you attach attributes',
      comp: withCard(TagsEdit) 
    },
    
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full items-center \
              lg:max-w-max lg:items-start lg:w-fit flex flex-col \
              lg:flex-row gap-5 mx-auto'},
  fields: [
    root_left_schema, root_right_schema
  ]
}
//
const root_schema22 = {
  name:'Root', comp: Div, comp_params: { className : 'flex flex-col gap-5 w-full max-w-[35rem]' },
  fields: [
    { 
      key: 'title',  name: 'Title', type: 'text', validate: true, 
      desc: 'A short title for the post',
      comp: withCard(withBling(MInput), {className: 'h-9', placeholder : 'enter a title' }), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'text', name: 'Post', type: 'text', validate: false, editable: true, 
      desc : 'Write your post with Markdown and HTML',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'tags', name: 'Tags', type: 'compund',  validate: false, editable: true, 
      desc: 'Tags help you attach attributes',
      comp: withCard(TagsEdit) 
    },
    { 
      key: 'media', name: 'Media', validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },

  ]
}

/**
 * @typedef {object} State
 * @property {PostData} data
 * @property {boolean} hasChanged
 */

export default ({ collectionId, mode, ...rest }) => {
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
      nav(`/apps/blog/${id}/edit`, { replace: true })
    }, [set, doc, nav]
  )

  const createPromise = useCallback(
    async () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, _] = await create(final);
      nav(`/apps/blog/${id}/edit`, { replace: true })
    }, [create, doc, nav]
  )

  const deletePromise = useCallback(
    async () => {
      await deleteDocument()
      nav(`/apps/blog`, { replace: true })
    }, [deleteDocument, nav, collectionId]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['posts', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId='posts'/>                     
  <RegularDocumentActions onClickSave={isEditMode ? savePromise : undefined}
             onClickCreate={isCreateMode ? createPromise : undefined}
             onClickDelete={!isCreateMode ? deletePromise : undefined} 
             className='mt-5'/>
  <CreateDate ref={ref_head} time={doc?.createdAt} 
              key={doc?.updatedAt} className='mt-8' 
              changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <EditMessage messages={error} className='w-full max-w-[35rem] mx-auto' />
    <FieldsView key={doc?.updatedAt} ref={ref_root} field={root_schema} 
                value={ doc ?? {} } 
                context={context}
                isViewMode={isViewMode} className='mx-auto' />      
  </ShowIf>
</div>
  )
}
