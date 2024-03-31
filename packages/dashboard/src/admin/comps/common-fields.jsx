import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useCallback, useState } from 'react'
import { AiOutlineDelete, AiOutlineWarning } from 'react-icons/ai/index.js'
import { BiEditAlt, BiErrorCircle } from 'react-icons/bi/index.js'
import { Link } from 'react-router-dom'
import { LoadingButton } from './common-button.jsx'
import Modal from './modal.jsx'
import ShowIf from './show-if.jsx'
import { RxCopy } from 'react-icons/rx/index.js'
import { IoClose } from 'react-icons/io5/index.js'
import { read_clipboard, write_clipboard } from '../utils/index.js'
import { to_handle } from '@/admin-sdk/utils.functional.js'
import { Bling, Card, HR, Input } from './common-ui.jsx'
import { LinkWithState } from '../hooks/useNavigateWithState.js'
import { FieldData } from './fields-view.jsx'

/**
 * 
 * @param {{id:string, name:string}[]} options [{id, name}, ...]
 * @param {number} defaultIndex do not use it (use defaultValue in fieldsview instead)
 */
export const create_select_view = (options, defaultIndex=0) => {

  /**
   * 
   * @param {object} p
   * @param {FieldData} p.field
   * @param {any} p.value
   * @param {any => any} p.onChange
   */
  const Select = ({field, value, onChange}) => {
    const { key, name, comp_params } = field
    const [selectedOption, setSelectedOption] = 
                        useState(value ?? options[defaultIndex])
    // useEffect(() => {
    //   onChange(selectedOption)
    // }, [selectedOption, onChange, options])

    const onSelect = useCallback(
      (e) => {
        const option = options.filter(it => it.id==parseInt(e.target.value))[0]
        setSelectedOption(option)
        onChange && onChange(option)
      }, [options])

      const { className, ...restInnerParams } = comp_params
      const cls = 'h-10 px-1 w-full shelf-input-color rounded-md text-sm \
                  focus:outline-none ' + className

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

export const TextArea = ({field, value, onChange, ...rest}) => {
  const { key, comp_params } = field
  return (
<textarea value={value} onChange={e=>onChange(e.target.value)} 
                {...comp_params}  />
  )
}

const readable_span_cls = 'pr-3 py-2 max-w-[18rem] overflow-x-auto inline-block whitespace-nowrap'

export const Span = 
  ({value, onChange, children, className, extra='max-w-[8rem] md:max-w-[18rem]', ...rest}) => {
  const readable_span_cls = 'overflow-x-auto inline-block whitespace-nowrap'
  const merged = `${readable_span_cls} ${className} ${extra}`
  return (
    <div className={merged} {...rest} >
      <div children={value ?? children} />
    </div>
  )
}

export const SpanArray = ( { 
      field, value, className, 
      classNameDelimiter='text-pink-600 font-bold text-lg', 
      delimiter=' / ', ...rest}) => {
        
  const VV = value?.map((it, ix) => (
    <span key={ix}>
      <span children={it}  />
      { ix<value?.length-1 && 
        <span children={delimiter} 
              className={classNameDelimiter} />
      }
    </span>
  ))

  return (
    <p className={`${readable_span_cls} ${className}`} 
        children={VV} {...rest} />
  )
}


export const TimeStampView = ({field, value, onChange, ...rest}) => {
  const { key, name, comp_params } = field
  function toUTCDateString(utcMillis) {
    const date = new Date(utcMillis).toLocaleDateString();
    return date
  }

  return (
    <p children={toUTCDateString(value)} {...comp_params} {...rest} />
  )
}

export const MInput = ({field, value, onChange, type='text', ...rest}) => {
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
 * 
 * @param {object} p
 * @param {string | number | undefined} p.value
 * @param {FieldData} p.field
 * @param {(any) => void )} p.onChange
 */
export const InputWithClipboard = ({ value, field, onChange, setError, ...rest}) => {

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

export const Handle = 
  ({ value, field, onChange, context, setError, ...rest}) => {

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

export const CompContainer = 
  ({Comp, field, value, className, name, onChange, error=undefined, ...rest}) => {
  return (
<div className={`rounded-lg bg-white border p-2 mr-2 mb-2 w-full ${className}`} 
      {...rest}>
  <div children={name} className='text-xs text-gray-500 mb-1 w-fit ' />
  <Comp field={field} value={value} onChange={onChange} />
  <p children={error} className='text-xs text-red-600 mt-1'/>
</div>
  )
}

export const ClipBoardCopy = ({ value, config=1, onClick }) => {
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

export const withCard = 
  (Comp, comp_params_inner = {}, border=true, copy=false) => {

  return ({ field, value, disable, onChange, children, 
            error=undefined, setError, context, ...rest}) => {
    const { key, desc, name, comp_params } = field
    const { className, ...rest_comp_params } = comp_params || {}
    const new_field = { ...field, comp_params : comp_params_inner }

    const Copy = useMemo(
      () => copy ? (
        <ClipBoardCopy value={JSON.stringify(value)}/>
      ) : null,
      [copy, value]
    ) 

    return (
<Card id='card' name={name} error={error} 
      {...comp_params} border={border} desc={desc}
      rightView={Copy} setError={setError}>
  <Comp field={new_field} value={value} onChange={onChange} 
        disable={disable} children={children} error={error} 
        setError={setError} context={context} {...comp_params_inner} />
</Card>
  )
  }
}


/**
 * 
 * @param {object} p
 * @param {object} p.context
 * @param {(x: string) => Promise<any>} p.context.deleteDocument
 * @param {(x: string) => string} p.context.editDocumentUrl
 * @param {() => any} p.context.state state to store for current page
 * @param {import('./collection-view').CollectionViewField} p.field
 * @param {any} p.value
 * @returns 
 */
export const RecordActions = 
  ({context, field, value, className, ...rest}) => {
  const ref_modal = useRef()
  const [loadingDelete, setLoadingDelete] = useState(false)
  const id = context.item[0]
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
             .finally(() => setLoadingDelete(false))
    }, [context]
  )

  return (
<span className='flex flex-row items-center text-center 
                 justify-end text-xl overflow-x-auto'>
  {/* { context?.viewDocumentUrl && 
  <Link to={context.viewDocumentUrl(id)}>
    <BiShow className=' text-xl text-teal-600 stroke-[0.5px] hover:stroke-[1px]' />
  </Link>
  } */}
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
</span>
  )
}
