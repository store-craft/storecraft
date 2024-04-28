import { useMemo, useRef } from 'react'
import { useCallback, useState } from 'react'
import { AiOutlineDelete, AiOutlineWarning } from 'react-icons/ai/index.js'
import { BiEditAlt, BiShow } from 'react-icons/bi/index.js'
import { LoadingButton } from './common-button.jsx'
import Modal from './modal.jsx'
import { RxCopy } from 'react-icons/rx/index.js'
import { read_clipboard, write_clipboard } from '../utils/index.js'
import { to_handle } from '@storecraft/sdk/src/utils.functional.js'
import { Bling, Card, Input } from './common-ui.jsx'
import { LinkWithState } from '../hooks/useNavigateWithState.js'
import { Link } from 'react-router-dom'

/**
 * 
 * @param {{id:string|number, name:string}[]} options [{id, name}, ...]
 * @param {number} defaultIndex do not use it (use defaultValue in fieldsview instead)
 */
export const create_select_view = (options, defaultIndex=0) => {

  /**
   * 
   * @param {import('./fields-view.jsx').FieldLeafViewParams<
   *  { id: string }>
   * } params 
   */
  const Select = ({field, value, onChange}) => {
    const { key, name, comp_params } = field;
    const [selectedOption, setSelectedOption] = useState(
      value ?? options[defaultIndex]
    );

    const onSelect = useCallback(
      (e) => {
        const option = options.find(
          it => it.id==parseInt(e.target.value).toString()
        );

        setSelectedOption(option)
        onChange && onChange(option)
      }, [options]
    )

    const { className, ...restInnerParams } = comp_params;
    const cls = 'h-10 px-1 w-full shelf-input-color rounded-md text-sm \
                focus:outline-none ' + className;

    return (
  <select name="limit" onChange={onSelect} 
          value={selectedOption.id} 
          className={cls} {...restInnerParams}>
  {
    options.map((t, ix) => (
      <option key={ix} value={t.id} children={t.name}/>
    ))
  }
  </select>                    
    )
  }

  return Select
}

/**
 * 
 * @param {import('./fields-view.jsx').FieldLeafViewParams<string>} param 
 */
export const TextArea = ({field, value, onChange, ...rest}) => {
  const { key, comp_params } = field
  return (
<textarea 
    value={value} 
    onChange={e=>onChange(e.target.value)} 
    {...comp_params}  />
  )
}

const readable_span_cls = 'pr-3 py-2 max-w-[18rem] \
overflow-x-auto inline-block whitespace-nowrap';

/**
 * This is used in `CollectionView`
 * 
 * @typedef {object} InternalSpanParams
 * @prop {string} [className]
 * @prop {string} [extra]
 * @prop {React.ReactNode} [children]
 * 
 * @typedef {import('./collection-view.jsx').CollectionViewComponentParams<string> & 
*   InternalSpanParams & 
*   React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
* } SpanParams
* 
* @param {SpanParams} param
*/
export const Span = (
  {
    value, children, className, 
    extra='max-w-[8rem] md:max-w-[18rem]', ...rest
  }
) => {

  const readable_span_cls = 'overflow-x-auto inline-block whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      <div children={value ?? children} />
    </div>
  )
}

/**
 * This is used in `CollectionView`
 * 
 * @typedef {object} InternalSpanArrayParams
 * @prop {string} [className]
 * @prop {string} [classNameDelimiter]
 * @prop {string} [delimiter]
 * @prop {(value: any) => string} [name_fn]
 * 
 * @typedef {import('./collection-view.jsx').CollectionViewComponentParams<any[]> & 
* InternalSpanArrayParams & 
* React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
* } SpanArrayParams
* 
* @param {SpanArrayParams} param
*/
export const SpanArray = ( 
  { 
    field, value, className, name_fn = t => t,  
    classNameDelimiter='text-pink-600 font-bold text-lg', 
    delimiter=' / ', ...rest
  }
) => {
        
  const VV = value?.map(
    (it, ix) => (
      <span key={ix}>
        <span children={name_fn(it)}  />
        { ix<value?.length-1 && 
          <span children={delimiter} 
                className={classNameDelimiter} />
        }
      </span>
    )
  );

  return (
    <p className={`${readable_span_cls} ${className}`} 
        children={VV} {...rest} />
  )
}

/**
 * 
 * This component is used in a `CollectionView` 
 * @param {import('./collection-view.jsx').CollectionViewComponentParams<string>
* } params 
*/
export const TimeStampView = ({field, value, ...rest}) => {
  const { key, name, comp_params } = field
  return (
    <p children={new Date(value).toLocaleDateString()} 
      {...comp_params} {...rest} />
  )
}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<string>
 * } InternalMInputParams
 * 
 * @typedef {InternalMInputParams & 
 * import('./common-ui.jsx').InputParams } MInputParams
 * 
 * 
 * @param {MInputParams} params
 * 
 */
export const MInput = (
  {
    field, value, onChange, type='text', ...rest
  }
) => {

  const { key, name, comp_params } = field
  const merged = { ...comp_params, ...rest}
  const { className, setError, error, ...rest_rest } = merged

  const onChangeInternal = useCallback(
    (e) => {
      let val = e.currentTarget.value
      if(type==='number')
        val = parseFloat(val)
      // console.log(val, type)
      onChange(val)
    }, [onChange, type]
  )

  return (
<Input type={field.type} 
      onWheel={(e) => e.target.blur()}
      className={className} 
      value={value ?? ''} 
      onChange={onChangeInternal} {...rest_rest}/>    
  )

}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<string>
 * } InternalInputWithClipboardParams
 * 
 * @typedef {InternalInputWithClipboardParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } InputWithClipboardParams
 * 
 * @param {InputWithClipboardParams} param
 * 
 */
export const InputWithClipboard = (
  { 
    value, field, onChange, setError, ...rest
  }
) => {

  const onClick = useCallback(
    async () => {
      const clipboard = await read_clipboard()
      console.log(clipboard)
      if(clipboard)
        onChange(clipboard)
    }, [onChange, read_clipboard]
  )

  return (
<div {...rest}>
  <div className='w-full flex flex-row justify-end'>
    <p children='From Clipboard' 
      className='w-fit underline cursor-pointer 
                 shelf-text-label-color
                 dark:bg-kf-50/10 p-1 rounded-md
                 text-sm font-medium tracking-wider' 
      onClick={onClick} />
  </div>
  <Bling className='w-full h-fit mt-2'>
    <MInput field={field} value={value} 
            onChange={onChange} 
            className='w-full h-10' />
  </Bling>
</div>    
  )
}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<string>
 * } InternalHandleParams
 * 
 * @typedef {InternalHandleParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } HandleParams
* 
* @param {HandleParams} param
* 
*/
export const Handle = (
  { 
    value, field, onChange, context, setError, ...rest
  }
) => {

  const onClick = useCallback(
    async () => {
      const title = context.query['title'].get()
      const handle = to_handle(value) ?? to_handle(title)
      onChange && onChange(handle)
    }, [onChange, context, value]
  )

  return (
<div {...rest}>
  <div className='w-full flex flex-row justify-end'>
    <p children='Auto Suggest' 
      className='w-fit underline cursor-pointer 
                  shelf-text-label-color
                dark:bg-kf-50/10 p-1 rounded-md
                 text-sm font-medium tracking-wider' 
      onClick={onClick} />
  </div>
  <Bling className='w-full h-fit mt-2'>
    <MInput field={field} value={value} 
            onChange={onChange} 
            className='w-full h-10' />
  </Bling>
</div>    
  )
}

/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<boolean>
 * } InternalSwitchParams
 * 
 * @typedef {InternalSwitchParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } SwitchParams
* 
* @param {SwitchParams} param
* 
*/
export const Switch = ({field, value=true, onChange, ...rest}) => {
  const { key, name, comp_params } = field
  const merged = { ...comp_params, ...rest}
  const { className } = comp_params

  const [toggle, setToggle] = useState(value)

  const onClickInternal = useCallback(
    () => {
      const new_toggle = !toggle
      setToggle(new_toggle)      
      onChange(new_toggle)
    }, [toggle, onChange]
  )

  let cls_container = `relative transition-all duration-300 --border
          rounded-3xl cursor-pointer w-16 h-8 flex flex-row`
  cls_container += (!toggle ? ' bg-red-400 ' : ' bg-teal-500 ')
  const cls_all = `absolute rounded-full w-1/2 h-full bg-white border shadow-md`
  const cls_anim = 'transition-all duration-300'
  const cls_toggle = toggle ? 'top-0 left-1/2' : 'top-0 left-0'
  const cls = cls_all + ' ' + cls_toggle + ' ' + cls_anim

  return (
<div className={cls_container} onClick={onClickInternal}>
  <div className={cls}  />
</div>    
  )
}


/**
 * 
 * @param {{
 *  value: string, config?: 0 | 1
 * }} param0 
 */
export const ClipBoardCopy = ({ value, config=1 }) => {
  const [copied, setCopied] = useState(false)

  const onClickCopy = useCallback(
    e => {
      setCopied(true)
      write_clipboard(value)
      setTimeout(
        () => setCopied(false),
        2000
      )
    }, [value, write_clipboard]
  )

  return (
<div className={`flex ${config==0 ? 'flex-row' : 'flex-row-reverse'} gap-1`}>
  <RxCopy className='text-lg cursor-pointer text-gray-500 
                      hover:text-gray-800 dark:hover:text-gray-400 inline 
                      --translate-y-0.5' 
          onClick={onClickCopy} />
  { copied && 
    <span children='(copied)' 
          className='text-xs --translate-x-2' />      
  }
</div>        
  )
}

/**
 * 
 * @param {React.FC} Comp 
 * @param {any} [comp_params_inner] 
 * @param {boolean} [border] 
 * @param {boolean} [copy] 
 */
export const withCard = (
  Comp, comp_params_inner = {}, border=true, copy=false
) => {

  /**
   * @param {import('./fields-view.jsx').FieldLeafViewParams<any> & 
   * { children: React.ReactNode}} params
   */
  return (
    { 
      field, value, disabled, onChange, children, 
      error=undefined, setError, context, ...rest
    }
  ) => {

    const { key, desc, name, comp_params } = field;
    const { className, ...rest_comp_params } = comp_params || {};
    const new_field = { ...field, comp_params : comp_params_inner };

    const Copy = useMemo(
      () => copy ? (
        <ClipBoardCopy value={JSON.stringify(value)}/>
      ) : null,
      [copy, value]
    );

    return (
<Card 
    id='card' 
    name={name} 
    error={error} 
    {...comp_params} 
    border={border} 
    desc={desc}
    rightView={Copy} 
    setError={setError}>
  <Comp 
      field={new_field} 
      value={value} 
      onChange={onChange} 
      disabled={disabled} 
      children={children} 
      error={error} 
      setError={setError} 
      context={context} 
      {...comp_params_inner} />
</Card>
  )
  }
}


/**
 * This component is used in a `CollectionView` 
 * @param {import('./collection-view.jsx').CollectionViewComponentParams
 * } params 
 */
export const RecordActions = (
  {
    context, field, value, ...rest
  }
) => {

  /** @type {React.MutableRefObject<import('./modal.jsx').ImpInterface>} */
  const ref_modal = useRef()
  const [loadingDelete, setLoadingDelete] = useState(false)
  const id = context.item.handle ?? context.item.id
  const onClickDelete = useCallback(
    () => {
      ref_modal.current.setDataAndMessage(
        id, 
        `Are you sure you want to remove ${id} ?`
      )
      ref_modal.current.show()
    }, [context]
  )

  const onApproveDelete = useCallback(
    (data_id) => {
      console.log('data_id', data_id)
      // return
      setLoadingDelete(true)
      context.deleteDocument(data_id)
             .finally(() => setLoadingDelete(false));
    }, [context]
  )

  return (
<div className='flex flex-row items-center text-center 
                 justify-end text-xl overflow-x-auto w-fit mx-auto '>
  { 
  !context?.editDocumentUrl && context?.viewDocumentUrl &&
  <Link to={context.viewDocumentUrl(id)}>
    <BiShow className=' text-xl text-teal-600 stroke-[0.5px] hover:stroke-[1px]' />
  </Link>
  }
  { 
  context?.editDocumentUrl && 
  <LinkWithState 
        to={context.editDocumentUrl(id)} draggable='false' 
        current_state={() => context?.getState && context?.getState()}
        >
    <BiEditAlt 
      className='ml-3 text-2xl text-pink-500 
                 stroke-0 hover:stroke-1' />
  </LinkWithState>
  }
  { 
    context?.deleteDocument && 
    <LoadingButton Icon={<AiOutlineDelete className='text-xl text-kf-500 outline-8'/>} 
                   loading={loadingDelete} 
                   className='ml-3 px-0 py-0 border-0 ' 
                   onClick={onClickDelete} />
  }
  <Modal ref={ref_modal} 
         onApprove={onApproveDelete} 
         title={
                <p className=' text-xl flex 
                                flex-row items-center gap-3'>
                  <AiOutlineWarning className='text-2xl'/> 
                  Warning
                </p>
              }/>
</div>
  )
}
