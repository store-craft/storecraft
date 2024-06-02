import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view.jsx'
import ShowIf from '@/comps/show-if.jsx'
import { MInput, withCard } from '@/comps/common-fields.jsx'
import DocumentTitle from '@/comps/document-title.jsx'
import { RegularDocumentActions } from '@/comps/document-actions.jsx'
import ErrorMessage from '@/comps/error-message.jsx'
import DocumentDetails from '@/comps/document-details.jsx'
import MDEditor from '@/comps/md-editor.jsx'
import TagsEdit from '@/comps/tags-edit.jsx'
import Media from '@/comps/media.jsx'
import Attributes from '@/comps/attributes.jsx'
import { withBling, CreateDate, Div } from '@/comps/common-ui.jsx'
import { useDocumentActions } from '../hooks/useDocumentActions.js'
import { useCallback } from 'react'

const root_left_schema = {
  name:'Root', comp: Div, 
  comp_params : { className:'w-full lg:w-[35rem] flex flex-col gap-5'},
  fields: [
    { 
      key: 'title',  name: 'Title', type: 'text', validate: true, 
      desc: 'A short title for the post',
      comp: withCard(
        withBling(MInput), {className: 'h-9', placeholder : 'enter a title' }
      ), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'text', name: '📝 Post', type: 'text', validate: false, editable: true, 
      desc : 'Write your post with Markdown and HTML',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'media', name: '🎬 Media', validate: false, editable: true, 
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
      key: 'tags', name: '# Tags', type: 'compund',  validate: false, editable: true, 
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
  name:'Root', comp: Div, 
  comp_params: { className : 'flex flex-col gap-5 w-full max-w-[35rem]' },
  fields: [
    { 
      key: 'title',  name: 'Title', type: 'text', validate: true, 
      desc: 'A short title for the post',
      comp: withCard(
        withBling(MInput), 
        { className: 'h-9', placeholder : 'enter a title' }
      ), 
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'text', name: 'Post', type: 'text', 
      validate: false, editable: true, 
      desc : 'Write your post with Markdown and HTML',
      comp: withCard(MDEditor),  comp_params: {className: 'w-full'} 
    },
    { 
      key: 'tags', name: 'Tags', type: 'compund', 
      validate: false, editable: true, 
      desc: 'Tags help you attach attributes',
      comp: withCard(TagsEdit) 
    },
    { 
      key: 'media', name: 'Media', validate: false, editable: true, 
      desc: 'Manage and edit your media files',
      comp: withCard(Media),  comp_params: {className: 'w-full'} 
    },
    {
      key: 'attributes', name: 'Attributes', 
      validate: false, editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },

  ]
}

/**
 * 
 * @typedef {object} State Intrinsic state of `post`
 * @property {import('@storecraft/core/v-api').PostType} data
 * @property {boolean} hasChanged
 * 
 *
 * @typedef { import('./index.jsx').BaseDocumentContext<State>
 * } Context Public `post` context
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
    *  import('@storecraft/core/v-api').PostType>
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
    'posts', documentId, '/pages/posts', mode, base
  );

  const duplicate_mod = useCallback(
    () => {
      return duplicate(
        {
          title: doc?.title + ' duplicate'
        }
      )
    }, [doc, duplicate]
  );


  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle major={['posts', documentId ?? 'create']} className='' />  
  <DocumentDetails doc={doc} className='mt-5' collectionId='posts'/>                     
  <RegularDocumentActions 
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      className='mt-5'/>
  <CreateDate 
      ref={ref_head} time={doc?.created_at} 
      key={doc?.updated_at} className='mt-8' 
      changes_made={hasChanged} />
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <ErrorMessage error={error} className='w-full max-w-[55rem] mx-auto' />
    <FieldsView 
        key={doc?.updated_at} ref={ref_root} 
        field={root_schema} 
        value={ doc ?? {} } 
        context={context}
        isViewMode={isViewMode} className='mx-auto' />      
  </ShowIf>
</div>
  )
}
