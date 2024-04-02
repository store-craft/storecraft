import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { PromisableLoadingBlingButton } from '@/admin/comps/common-button.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import Media from '@/admin/comps/media.jsx'
import { MInput, Div, withCard, 
  Handle, Switch } from '@/admin/comps/common-fields.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import { getSDK } from '@/admin-sdk/index.js'
import { MdPublish } from 'react-icons/md/index.js'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import ProductsInCollection from '@/admin/comps/products-in-collection.jsx'
import EditMessage from '@/admin/comps/edit-message.jsx'
import TagsEdit from '@/admin/comps/tags-edit.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import BulkTagProductsInCollection from '@/admin/comps/bulk-tag-products-in-collection.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, withBling } from '@/admin/comps/common-ui.jsx'
// import { CollectionData } from '@/admin-sdk/js-docs-types'
import { decode, encode } from '@/admin/utils/index.js'
import useNavigateWithState from '@/admin/hooks/useNavigateWithState.js'

const left = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full flex flex-col gap-5 max-w- lg:w-[35rem]'},
  fields: [
    {
      comp: ProductsInCollection,
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'title', name: 'Title', type: 'text',  validate: true, editable: true, 
      desc: 'Give an efficient title to the collection, e.g. - Women shirts',
      comp: withCard(withBling(MInput), {className:'w-full h-10'}),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'handle',  name: 'Handle',  type: 'text',  validate: false, editable: true, 
      desc : 'A handle uniquely identifies the collection.\nWill be computed automatically if not filled by the product title', 
      comp: withCard(Handle, {className:'w-full h-fit'}),
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'desc', name: 'Description', type: 'text', validate: false, editable: true, 
      desc : 'Describe the collection for your customers',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'media', name: 'Media', validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  
      comp_params: {className: 'w-full'} 
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
      key: 'tags', name: 'Tags', type: 'compund', validate: false, editable: true, 
      desc: 'Use tags to attach attributes to the collection',
      comp: withCard(TagsEdit),
      comp_params: {className: 'w-full  '}  
    },
    {
      comp: BulkTagProductsInCollection,
      comp_params: {className: 'w-full'} 
    },
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
      <PromisableLoadingBlingButton Icon={<MdPublish />} text='publish' 
                    show={Boolean(onClickPublish)}
                    onClick={onClickPublish} className='' />
  </RegularDocumentActions>  
  )
}

/**
 * @typedef {object} State
 * @property {CollectionData} data
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
  const [ externalErrors, setExternalErrors] = useState(undefined)

  const { 
    nav, navWithState, state 
  } = useNavigateWithState()

  // console.log('KKKKK ', doc);

  const ref_head = useRef()
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)
  // const nav = useNavigate()

  /**@type {CollectionData} */
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
          handle: undefined,
          _published: undefined,
        },
        hasChanged: false
      }
      // ref_head.current.set(false)
      navWithState(`/pages/${collectionId}/create`, 
            state, state_next)
    }, [navWithState, collectionId, context]
  )

  const savePromise = useCallback(
    async (apply_navigation = true) => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      // console.log('final ', final);
      const [id, dd] = await set(final)
      if(apply_navigation)
        nav(`/pages/${collectionId}/${id}/edit`, { replace: true })
      return [id, dd]
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

  const publishPromise = useCallback(
    async () => {
      await savePromise(false)
      setExternalErrors(undefined)
      try {
        await getShelf().collections.publish(documentId, 400)
        await reload()
      } catch (e) {
        setExternalErrors(e.toString())
      }
    }, [documentId, savePromise, reload]
  )

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={[collectionId, documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId={collectionId} />                     
  <Actions onClickSave={isEditMode ? savePromise : undefined}
            onClickCreate={isCreateMode ? createPromise : undefined}
            onClickPublish={!isCreateMode ? publishPromise : undefined}
            onClickDelete={!isCreateMode ? deletePromise : undefined} 
            onClickDuplicate={!isCreateMode ? duplicate : undefined}
            onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
            id={docId}
            className='mt-5'/>
  <CreateDate changes_made={hasChanged} ref={ref_head}  
              key={doc?.updatedAt}
              time={doc?.createdAt} className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >      
    <div className='w-full max-w-[40rem] lg:w-fit lg:max-w-none mx-auto'>
      <EditMessage messages={error} className='w-full' />
      <FieldsView key={key} ref={ref_root} 
                  field={root_schema} 
                  context={context}
                  value={ doc ?? {} } 
                  isViewMode={isViewMode} className='mt-8' />      
      </div>                

  </ShowIf>   
</div>
  )
}