import { useCallback, useState, 
         useImperativeHandle, 
         forwardRef, useEffect } from 'react'

export const Input = forwardRef((
  { 
    className, title='', text='', warning=undefined, 
    onUpdate=undefined, inputClassName='', type='text', ...rest
  }, ref
) => {

  const [inner_text, setText] = useState(text)
  const [isFocused, setFocused] = useState(false)
  const [warn, setWarning] = useState(warning)

  const cls_span = (isFocused || inner_text!=='')  ? 'opacity-100 top-1' : 'opacity-0 top-3'
  const cls_input = (isFocused || inner_text!=='')  ? 'px-2 pt-5' : 'px-2'

  useEffect(() => {
    setText(text)
  }, [text])  

  const onChange = useCallback(e => {
    const v = e.currentTarget.value
    if(warn) setWarning(undefined)
    if(onUpdate!== undefined) onUpdate(v)
    setText(v)
  }, [warn, onUpdate])

  useImperativeHandle(ref, () => ({
    getText : () => inner_text
  }), [inner_text])

  return (
<div className={`${className} relative group h-fit`} >
  <input type={type}
        onWheel={(e) => type==='number' && e.target.blur()}
        className={`${cls_input} ${inputClassName} rounded-md h-12 w-full 
                    focus:outline-none block text-sm text-black
                  placeholder-gray-500 --bg-slate-300 rounded-xs
                  --focus:ring-blue-500 --focus:border-4 --focus:border-blue-500
                  font-normal pl-2 focus-visible:false transition-colors`} 
        value={inner_text}
        placeholder={title} required='' ref={ref} onBlur={()=>setFocused(false)} 
              onFocus={()=>setFocused(true)} onChange={onChange} {...rest}/>
  <div style={{direction:'rtl'}} 
       className={`${cls_span} duration-300 font-heb_1 text-xs 
                   font-thin pointer-events-none absolute 
                   transition-all left-2`} 
        ccchildren={title}>
    <span>{title}</span>
    { warn && <span className='text-red-500'>{' ' + warning}</span>}
  </div>
</div>
    
  )
 }
)

export const RegularInput = forwardRef(
  ({ className='h-12', title='', text='', warning=undefined, onUpdate=undefined, 
     inputClassName='', disabled=false, type='text', integer=false, ...rest}, ref) => {
  const [inner_text, setText] = useState(text)
  const [isFocused, setFocused] = useState(false)
  const [warn, setWarning] = useState(warning)

  useEffect(() => {
    
    setText(text)
  }, [text])  

  const onChange = useCallback(e => {
    let v = e.currentTarget.value
    if(type==='number')
      v=parseFloat(v)
    if(integer)
      v=parseInt(v)
    if(warn) setWarning(undefined)
    setText(v)
    if(onUpdate!== undefined) 
      onUpdate(v)
  }, [warn, onUpdate, type, integer])

  useImperativeHandle(ref, () => ({
    getText : () => inner_text
  }), [inner_text])

  return (
<div className={`relative group h-full ${className}`} >
  <input type={type}
        onWheel={(e) => type==='number' && e.target.blur()}
        className={`${inputClassName} border-b border-kf-300 rounded-md h-full 
                   --h-12 px-3 w-full focus:outline-none block text-sm text-black 
                  placeholder-gray-500 bg-slate-100 rounded-xs 
                  focus:ring-blue-500 focus:border focus:border-kf-400 
                  font-normal transition-none`} value={inner_text} disabled={disabled}
        placeholder={title} required="" ref={ref} onBlur={()=>setFocused(false)} 
              onFocus={()=>setFocused(true)} onChange={onChange} {...rest}/>
</div>
    
  )
 }
)

