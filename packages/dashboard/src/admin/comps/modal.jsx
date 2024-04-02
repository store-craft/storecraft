import { forwardRef, useCallback, 
  useImperativeHandle, useRef, useState } from 'react'
import { Bling, Card, Title } from './common-ui.jsx'
import { Overlay } from './overlay.jsx'
import { BlingButton } from './common-button.jsx'


/**
 * Imperative interface
 * @typedef {object} ImpInterface
 * @property {Function} show
 * @property {Function} hide
 * @property {(data: any, message: string, show?: boolean) => void} setDataAndMessage
 */

const QP = {}
const Modal = forwardRef(
  /**
   * 
   * @param {object} param0 
   * @param {import('react').ReactElement} param0.title 
   * @param {(key: string, value: any) => void} param0.onApprove 
   * @param {any} ref 
   * @returns 
   */
  (
  { 
    title=(<p children='NA' className='text-gray-500' />), 
    onApprove, ...rest
  }, ref
) => {
  const [dm, setDM] = useState({ data: undefined, message: 'NA'});

  /** @type {import('react').MutableRefObject<import('./overlay.jsx').ImpInterface>} */
  const ref_overlay = useRef();

  useImperativeHandle(
    ref,
    /** @returns {ImpInterface} */
    () => ({
      hide: () => ref_overlay.current.hide(),
      show: () => ref_overlay.current.show(),
      setDataAndMessage: (data, message, show) => {
        setDM({data, message})
        if (show)
          ref_overlay.current.show()
      }
    }),
    []
  );

  const onSelectInternal = useCallback(
    /**
     * @param {Event} e 
     * @param {*} v 
     */
    (e, v) => { 
      if(onApprove===undefined)
        return

      // // steal the event from processing
      e.preventDefault()
      e.stopPropagation()

      // // console.log('img', img);
      ref.current.hide()
      onApprove(dm.data, v)
    }, [dm, onApprove]
  );
  
  return (
<Overlay ref={ref_overlay} >
  <Card name={title} cardClass='shelf-card-light' 
        className='w-96' onClick={e => e.stopPropagation()} >
    <p children={dm.message} className='text-red-500 text-base break-words' />
    <div className='flex flex-row justify-between mt-10 text-base'>
      <BlingButton stroke='pb-0.5' 
              btnClassName='rounded-none'
              rounded='rounded-none'
              children='No' 
              onClick={() => ref.current.hide()} />
      <BlingButton stroke='pb-0.5' 
            btnClassName='rounded-none'
            rounded='rounded-none'
            children='Yes' 
            onClick={e => onSelectInternal(e)} />
    </div>
  </Card>
</Overlay>
  )
})

export default Modal
