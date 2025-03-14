import { Span } from './common-fields.jsx'
import ShowIf from './show-if.jsx'
import { Link } from 'react-router-dom'
import { RxCopy } from 'react-icons/rx/index.js'
import { useCallback } from 'react'
import { write_clipboard } from '../utils/index.js'
import { useState } from 'react'
import { useStorecraft } from '@storecraft/sdk-react-hooks'

/**
 * @param {object} p
 * @param {string} p.value
 */
const ClipBoardCopy = ({ value }) => {
  const [copied, setCopied] = useState(false)

  /** @type {React.MouseEventHandler<SVGElement>} */
  const onClickCopy = useCallback(
    (e) => {
      setCopied(true)
      write_clipboard(value)
      setTimeout(
        () => setCopied(false),
        2000
      )
    }, [value, write_clipboard]
  )

  return (
<>
  <RxCopy 
      className='text-base cursor-pointer text-gray-500 
                hover:text-gray-800 dark:hover:text-gray-400 
                inline -translate-y-0.5' 
      onClick={onClickCopy} />
  { copied && 
    (
      <span 
          children='(copied)' 
          className='text-xs -translate-x-2' />      
    )
  }
</>        
  )
}

/**
 * @typedef {object} InternalDocumentDetailsParams
 * @prop {import('@storecraft/core/api').BaseType} doc
 * @prop {string} collectionId
 * @prop {string} [className]
 * 
 * @typedef {InternalDocumentDetailsParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } DocumentDetailsParams
 * 
 * @param {DocumentDetailsParams} param
 */
const DocumentDetails = (
  {
    doc, collectionId, className, ...rest
  }
) => {

  const { sdk } = useStorecraft();

  const onClickPublish = useCallback(
    async () => {
      const blob = await sdk.storage.getBlob(
        doc?.published?.split('storage://')?.at(-1)
      );
      const winUrl = URL.createObjectURL(
        new Blob(
          [blob], 
          { 
            type: 'application/json' 
          }
        )
      );
    
      const win = window.open(
          winUrl,
          "_blank",
      );
    }, [doc, sdk]
  );
  

  if (!doc?.updated_at || !collectionId)
    return null

  console.log('doc ', doc)
  const date_ = new Date(doc.updated_at);
  const has_publish = doc.published;
  let dateString = date_.toLocaleDateString() + '\n (last updated)'
  let title = 'exported @ '

  if(collectionId==='discounts')
    title = 'collection @ '

  if(!has_publish) 
    title = ''



  return (
<ShowIf show={doc}>
  <div className={`w-full flex flex-row justify-between text-sm 
                 text-gray-500 dark:text-gray-400 ${className}`} {...rest}>
    <div className='items-center  w-3/5 font-mono'>
      <div children={title} 
           className='bg-kf-50 text-kf-600
                      dark:bg-kf-50/20 dark:text-kf-300
                       w-fit 
                       rounded-lg px-1 font-light' />
      <ShowIf show={collectionId==='discounts'}>
        <Link to={`/pages/collections/discount-${doc?.handle}`}
              draggable='false'>
          <Span className='w-full max-w-[30rem] underline' 
                children={doc?.published ?? ''} />
        </Link>    
      </ShowIf>            
      <ShowIf show={collectionId!=='discounts' && doc?.published}>
        <div className='flex flex-row items-center gap-2 cursor-pointer'>
          <div onClick={onClickPublish}
            draggable='false'
            rel='noopener noreferrer'>
            <Span className='w-full max-w-[30rem] underline' 
                  children={doc?.published ?? ''} />
          </div>
          <ClipBoardCopy value={doc?.published ?? ''} />
        </div>
      </ShowIf>            
    </div>
    <div className='whitespace-pre-line text-right font-semibold' 
         children={dateString} />
  </div>
</ShowIf>      
  )
}

export default DocumentDetails