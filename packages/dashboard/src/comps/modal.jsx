import { forwardRef, useCallback, 
  useImperativeHandle, useRef, useState } from 'react'
import { Card } from './common-ui.jsx'
import { Overlay } from './overlay.jsx'
import { BlingButton } from './common-button.jsx'


/**
 * Imperative interface
 * 
 * @typedef {object} ImpInterface Imperative interface
 * @property {Function} show
 * @property {Function} hide
 * @property {(
 *  data: any, message: string, show?: boolean
 * ) => void} setDataAndMessage
 * 
 */

const QP = {}
const Modal = forwardRef(
  /**
   * 
   * @typedef {object} InnerModalParams
   * @prop {React.ReactElement} [title] 
   * @prop {(key: string, value: any) => void} onApprove 
   * 
   * 
   * @typedef {InnerModalParams & 
   *  Omit<
   *    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
   *    'title'
   *  >
   * } ModalParams
   * 
   * 
   * @param {ModalParams} params 
   * @param {any} ref 
   * 
   */
  (
    { 
      title=(<p children='NA' className='text-gray-500' />), 
      onApprove, ...rest
    }, ref
  ) => {

    const [dm, setDM] = useState({ data: undefined, message: 'NA'});

    /** @type {React.MutableRefObject<import('./overlay.jsx').ImpInterface>} */
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
       * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} e 
       * @param {*} v 
       */
      (e, v) => { 
        if(onApprove===undefined)
          return

        // steal the event from processing
        e.preventDefault();
        e.stopPropagation();

        ref.current.hide();
        onApprove(dm.data, v);
      }, [dm, onApprove]
    );
    
    return (
  <Overlay ref={ref_overlay} >
    <Card 
        name={title} 
        cardClass='shelf-card-light' 
        className='max-w-96 w-full' 
        onClick={e => e.stopPropagation()} >
      <p 
          children={dm.message} 
          className='text-red-500 text-lg break-words w-full whitespace-pre-wrap' />
      <div className='flex flex-row justify-between mt-10 text-base'>
        <BlingButton 
            stroke='border-b-2' 
            btnClassName='rounded-none'
            rounded='rounded-none'
            children='No' 
            onClick={() => ref.current.hide()} />
        <BlingButton stroke='border-b-2' 
            btnClassName='rounded-none'
            rounded='rounded-none'
            children='Yes' 
            onClick={e => onSelectInternal(e)} />
      </div>
    </Card>
  </Overlay>
    )
  }
)

export default Modal
