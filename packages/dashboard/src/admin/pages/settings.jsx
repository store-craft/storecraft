import { TbCloudComputing } from 'react-icons/tb/index.js'
import Header from '@/admin/comps/home-header.jsx'
import { useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FieldsView from '@/admin/comps/fields-view.jsx'
import { useCommonApiDocument } from '@/shelf-cms-react-hooks/index.js'
import ShowIf from '@/admin/comps/show-if.jsx'
import { 
  MInput, Div, withCard, 
  } from '@/admin/comps/common-fields.jsx'
import DocumentTitle from '@/admin/comps/document-title.jsx'
import { RegularDocumentActions } from '@/admin/comps/document-actions.jsx'
import ErrorMessage from '@/admin/comps/error-message.jsx'
import Attributes from '@/admin/comps/attributes.jsx'
import { JsonViewCard } from '@/admin/comps/json.jsx'
import SecretView from '@/admin/comps/secret-view.jsx'
import { CreateDate, withBling } from '@/admin/comps/common-ui.jsx'
// import StorageSettings from '@/admin/comps/settings-storage.jsx'

const Backend = () => {
  
  return (
  <div className=' text-gray-500'>
    <Header label='Backend' Icon={TbCloudComputing} 
            iconClassName=''
            className='--mt-10 items-center' />
  </div>
  )
}

const backend_schema = {
  key:'backend', name:'Root', comp: Div, 
  comp_params : { className:'w-full flex flex-col gap-5'},
  fields: [
    { 
      comp: ()=>(<div children='Backend' className='text-2xl'/>),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'url', name: 'URL', type: 'text',  validate: false, editable: true, 
      desc: 'The URL of your backend',
      comp: withCard(withBling(MInput), { className:'h-10' }, true, true),  
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'apiKey',  name: 'API KEY',  type: 'text', validate: false, editable: true, 
      comp: withCard(SecretView, {className:'w-full h-fit'}),
      desc: 'An API key, will be sent with each request to backend',
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'secret',  name: 'Secret',  type: 'text', validate: false, editable: true, 
      comp: withCard(SecretView, {className:'w-full h-fit'}),
      desc: 'A secret used to sign a JWT for enhanced authentication (more secure than apiKey), you can decide if to respond to apiKey or JWT',
      comp_params: {className: 'w-full h-fit'} 
    },
  ]
}

const storage_schema = {
  name:'Storage', comp: Div, 
  comp_params : { className: 'w-full flex flex-col gap-5'},
  fields: [
    { 
      comp: ()=>(<div children='Storage' className='text-2xl'/>),  
      comp_params: {className: 'w-full h-fit'} 
    },
    // { 
    //   key: 'storage', name: 'Storage',
    //   desc: 'Configure your assets storage provider',
    //   comp: withCard(StorageSettings, { className:'h-10' }, true, false),  
    //   comp_params: {className: 'w-full h-fit'} 
    // },
  ]
}

const root_schema = {
  name:'Root', comp: Div, comp_params : { 
    className:'w-full --lg:w-[37rem] --max-w-[35rem] --bg-red-100 items-center \
              --lg:max-w-max lg:items-start --lg:w-fit flex flex-col \
              gap-5 mx-auto'},
  fields: [
    storage_schema,
    backend_schema, //root_right_schema
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

export default ({ collectionId, 
                  mode, ...rest}) => {

  const { id, base } = useParams()
  const ref_root = useRef()
  const { 
    doc, loading, hasLoaded, error, op,
    actions: { 
      reload, set, create, deleteDocument, colId, docId 
    }
  } = useCommonApiDocument('settings', 'main', true, false)
  // console.log('doc_original', doc_original)
  
  const nav = useNavigate()

  const savePromise = useCallback(
    () => {
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      console.log('final ', final);
      return set(final)
    }, [set, doc]
  )

  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  )

  return (
<div className='w-full mx-auto'>
  <DocumentTitle major={['settings', 'main']} className='' />  
  <RegularDocumentActions             
             onClickSave={savePromise}
             onClickReload={(async () => reload(false))}
             id={docId}
             className='mt-5'/>
  <CreateDate time={doc?.updatedAt} rightText='updated at: '
              key={doc?.updatedAt} className='mt-8' 
              changes_made={false} />
  <ShowIf show={hasLoaded} className='mt-8'>
    <div className='w-full max-w-[40rem] --lg:w-fit --lg:max-w-none mx-auto'>
      <EditMessage messages={error} className='w-full' />
      <FieldsView key={key} ref={ref_root} 
                  field={root_schema} 
                  value={ doc ?? {} } 
                  isViewMode={false} className='mt-8' />      
    </div>                
  </ShowIf>
</div>
  )
}