import { useCallback, useEffect, useRef, useState } from 'react'
import { AiOutlineDelete, AiOutlineLink, AiOutlineTags, AiOutlineWarning } from 'react-icons/ai'
import { SlActionRedo } from 'react-icons/sl'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCommonApiDocument } from '../../../shelf-cms-react-hooks'
import { Bling, Card } from '../../comps/common-ui'
import DocumentTitle from '../../comps/document-title'
import ShowIf from '../../comps/show-if'
import Header from './image-header'
import Img from '../../comps/Img'
import Modal from '../../comps/modal'
import { LoadingButton } from '../../comps/common-button'

const LabelCapsule = ({ value, className='', label=value,
                               bgColor='bg-pink-500', ...rest }) => {
  const bg_color = (typeof bgColor === 'function') ? 
                    bgColor(value): bgColor
  const lbl = (typeof label === 'function') ? label(value) : 
              (typeof label==='string' ? label :
              (typeof value==='string' ? value : 'missing')) 

  return (
<div className={`font-medium cursor-pointer text-white w-fit 
               p-1 px-3 rounded-full whitespace-nowrap --my-1
               hover:scale-105 transition-transform inline-block
               max-w-full overflow-x-auto
               ${className} ${bg_color}`} 
               children={lbl} {...rest} />
  )
}

const Tags = ({ search=[], className, ...rest }) => {

  return (
<div className={`flex flex-row flex-wrap gap-2 ${className} `} {...rest}>
  {
  search.map((it, ix) => (
    <LabelCapsule value={it} key={ix} />
  ))
  }
</div>    
  )
}

const Usage = ({ usage=[], ...rest }) => {

  if(usage.length==0)
    return (
      <p children='No usage recorded' />
    )

  return (
<div>
  {
  usage.map((it, ix) => (
    <Link to={`/pages/${it}/edit`} draggable='false' key={ix}>
      <p children={it} className='shelf-text-label-color underline font-semibold' />
    </Link>
  ))
  }
</div>    
  )
}

const ImagePage = ({}) => {
  const { handle } = useParams()
  const { 
    doc, loading, hasLoaded, error, op,
    actions: { deleteDocument }
  } = useCommonApiDocument('images', handle)

  const ref_modal = useRef()   
  const [loadingDelete, setLoadingDelete] = useState(false)  
  const nav = useNavigate() 

  const onClickDeleteInternal = useCallback(
    () => {
      ref_modal.current.setDataAndMessage(
        handle, 
        `Are you sure you want to remove ${handle} ?`
      )
      ref_modal.current.show()
    }, [handle]
  )
  
  const onApproveDelete = useCallback(
    async (data_id) => {
      setLoadingDelete(true)
      try {
        await deleteDocument();
        nav(-2, {replace: true})
      } catch(e) {
        console.log(e)
      } finally {
        setLoadingDelete(false)
      }
    }, [deleteDocument, nav]
  )
  
  return (
<div className='w-full h-full'>
  <DocumentTitle major={['images', handle]} className='' />  
  <ShowIf show={hasLoaded} >
    <Card className='mt-10' error={error}>
      <div className='flex flex-col gap-10'>
        <div className='self-end'>
          <Bling stroke='p-0.5' className='w-fit h-fit' rounded='rounded-full'>
            <LoadingButton 
                    className='h-6 px-2 
                    bg-slate-50 dark:bg-slate-800 
                    text-gray-600 dark:text-gray-400 
                    rounded-full text-base font-semibold tracking-tight' 
                    Icon={<AiOutlineDelete className='--text-red-500 text-base'/>}                        
                    loading={loadingDelete} 
                    text='delete'
                    onClick={onClickDeleteInternal}  />
          </Bling>     

        </div>

        <ShowIf show={doc && hasLoaded}>
          <Img src={doc?.url} draggable='false'
              crossOrigin='anonymous'
              className='w-fit mx-auto h-full rounded-lg' />

          <div className='w-full'>
            <Header label='Url' Icon={AiOutlineLink} className='' />
            <a href={doc?.url} target='_blank' >
              <div children={doc?.url} 
                  className='break-words w-full underline' />
            </a>
          </div>    

          <ShowIf show={doc?.ref}>
            <div className='w-full'>
              <Header label='Ref' Icon={AiOutlineLink} className='' />
              <div href={doc?.ref} target='_blank' >
                <div children={doc?.ref} 
                    className='break-words w-full' />
              </div>
            </div>    
          </ShowIf>

          <div className='w-full'>
            <Header label='Usage' Icon={SlActionRedo} className='' />

            <Usage usage={doc?.usage} />
          </div>    

          <div className='w-full'>
            <Header label='Tags' Icon={AiOutlineTags} className='' />

            <Tags search={doc?.search} />
          </div>    
        </ShowIf>

      </div>
    </Card>
  </ShowIf>
  <Modal ref={ref_modal} 
         onApprove={onApproveDelete} 
         title={
                <p className='text-xl flex 
                              flex-row items-center gap-3'>
                  <AiOutlineWarning className='text-2xl'/> 
                  Warning
                </p>
              }/>  

</div>    
  )
}

export default ImagePage