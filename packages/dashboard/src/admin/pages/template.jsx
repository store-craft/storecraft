import { useParams } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import ShowIf from '@/admin/comps/show-if.jsx'
import { MInput, withCard } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import DocumentDetails from '@/admin/comps/document-details.jsx'
import MDEditor from '@/admin/comps/md-editor.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import { CreateDate, Div, withBling } from '@/admin/comps/common-ui.jsx'
import { useDocumentActions } from '../hooks/useDocumentActions.js'
import { useCallback, useState } from 'react'
import TemplateTemplate from '../comps/template-template.jsx'


const root_schema = {
  name:'Root', comp: Div, 
  comp_params: { 
    className : 'flex flex-col gap-5 w-full max-w-[35rem]' 
  },
  fields: [
    { 
      key: 'title',  name: 'Title', type: 'text', validate: true, 
      // desc: 'Use simple key names, like `color` for quick attributes creation',
      comp: withCard(
        withBling(MInput, {}), 
        { 
          className: 'h-9', placeholder : 'enter the key / name of the tag',
        }
      ), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'template', name: 'Template', 
      defaultValue: '<html></html>',
      desc: 'Use simple value names, like `red`, `green`, `white` for quick attributes creation',
      comp: withCard(TemplateTemplate), 
      comp_params: { className: 'w-full' } 
    },
    { 
      key: 'description', name: '📝 Description', type: 'text', validate: false, 
      editable: true, desc : 'Describe the purpose of this tag',
      comp: withCard(MDEditor),  comp_params: { className: 'w-full' } 
    },
    {
      name: 'JSON', type: 'compund', validate: false, editable: false, 
      desc: 'Observe the RAW data',
      comp: ({value}) => <JsonViewCard value={{...value, template: '...'}}/>,
      comp_params: { className: 'w-full' }
    },
  ]
}

/**
 * 
 * @typedef {object} State Intrinsic state of `tag`
 * @property {import('@storecraft/core/v-api').TagType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
 * } Context Public `tag` context
 * 
 */


/**
 * @param {{ 
 *  mode: import('../hooks/useDocumentActions.js').DocumentActionsMode 
 * }} params
 */
export default (
 { 
   mode, ...rest
 }
) => {
                   
  const { id : documentId, base } = useParams();

  /** 
  * @type {import('../hooks/useDocumentActions.js').HookReturnType<
  *  import('@storecraft/core/v-api').TemplateType>
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
    'templates', documentId, '/apps/templates', mode, base
  );

  const [template, setTemplate] = useState('');

  const onChange = useCallback(
    (value) => {
      setTemplate(value);
    }, []
  )

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
      key={key} 
      ref={ref_root} 
      field={root_schema} 
      value={doc ?? {}} 
      context={context}
      isViewMode={isViewMode} 
      className='mx-auto' />   

  </ShowIf>
</div>
  )
}
