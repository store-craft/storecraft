import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view.jsx'
import ShowIf from '@/comps/show-if.jsx'
import { MInput, withCard } from '@/comps/common-fields.jsx'
import DocumentTitle from '@/comps/document-title.jsx'
import { RegularDocumentActions } from '@/comps/document-actions.jsx'
import TagValues, { values_validator } from '@/comps/tag-values.jsx'
import ErrorMessage from '@/comps/error-message.jsx'
import DocumentDetails from '@/comps/document-details.jsx'
import MDEditor from '@/comps/md-editor.jsx'
import { JsonViewCard } from '@/comps/json.jsx'
import { CreateDate, Div, withBling } from '@/comps/common-ui.jsx'
import { useDocumentActions } from '@/hooks/use-document-actions.js'
import Attributes from '@/comps/attributes.jsx'

const root_schema = {
  name:'Root', comp: Div, 
  comp_params: { 
    className : 'flex flex-col gap-5 w-full max-w-[35rem]' 
  },
  fields: [
    { 
      key: 'handle',  name: 'Name', type: 'text', validate: true, 
      desc: 'Use simple key names, like `color` for quick attributes creation',
      comp: withCard(
        withBling(MInput), 
        { 
          className: 'h-9', placeholder : 'enter the key / name of the tag' 
        }
      ), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'values', name: 'Values', type: 'text', validate: true, 
      desc: 'Use simple value names, like `red`, `green`, `white` for quick attributes creation',
      validator: values_validator ,
      comp: withCard(TagValues), 
      comp_params: { className: 'w-full' } 
    },
    {
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'description', name: '📝 Description', type: 'text', validate: false, 
      editable: true, desc : 'Describe the purpose of this tag',
      comp: withCard(MDEditor),  comp_params: { className: 'w-full' } 
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
 * 
 * @typedef {object} State Intrinsic state of `tag`
 * @property {import('@storecraft/core/api').TagType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
 * } Context Public `tag` context
 * 
 */


/**
 * @param {{ 
 *  mode: import('@/hooks/use-document-actions.js').DocumentActionsMode 
 * }} params
 */
export default (
 { 
   mode, ...rest
 }
) => {
                   
 const { id : documentId, base } = useParams();

 /** 
  * @type {import('@/hooks/use-document-actions.js').HookReturnType<
  *  import('@storecraft/core/api').TagType>
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
   'tags', documentId, '/pages/tags', mode, base
 );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['tags', documentId ?? 'create']} className='' />
  <DocumentDetails doc={doc} className='mt-5' collectionId={'tags'}/>                     
  <RegularDocumentActions
      id={doc.handle}
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined}
      className='mt-5'/>
  <CreateDate 
      ref={ref_head} 
      time={doc?.created_at} 
      key={doc?.updated_at} className='mt-8' 
      changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <ErrorMessage error={error} className='w-full max-w-[35rem] mx-auto' />
    <FieldsView 
        key={key} ref={ref_root} field={root_schema} 
        value={ doc ?? {} } context={context}
        isViewMode={isViewMode} className='mx-auto' />      
  </ShowIf>
</div>
  )
}
