import { 
  useCallback, useState, 
  useImperativeHandle, forwardRef 
} from 'react'

export type InputProps = {
  input?: {
    onUpdate?: (text: string) => void,
    text?: string,
    warning?: string,
    title?: string,
    inputClassName?: string,
  }
} & React.ComponentProps<'div'>;

export type InputImperativeinterface = {
  getText: () => string
}

export const Input = forwardRef(
  (
    { 
      input: {
        title='', text='', warning=undefined, 
        onUpdate=undefined, inputClassName=''
      }, className, ...rest 
    }: InputProps, ref: React.ForwardedRef<InputImperativeinterface>
  ) => {

    const [inner_text, setText] = useState(text)
    const [isFocused, setFocused] = useState(false)
    const [warn, setWarning] = useState()

    const cls_span = (isFocused || inner_text!=='') ? 
      'opacity-70 top-1' : 'opacity-0 top-3'
    const cls_input = (isFocused || inner_text!=='') ? 
      'px-2 pt-5' : 'px-2'

    const onChange = useCallback(
      e => {
        const v = e.currentTarget.value
        if(warn) setWarning(undefined)
        onUpdate && onUpdate(v)
        setText(v)
      }, [onUpdate, warn]
    );

    useImperativeHandle(
      ref, 
      () => ({
        getText : () => inner_text
      }),
      [inner_text]
    );

    return (
      <div 
        className={`${className} relative group h-fit`} 
        sstyle={{direction:'rtl'}}>

        <input 
          type='input'
          onWheel={(e) => e.target.blur()}
          className={
            `${cls_input} 
            rounded-md w-full 
            focus:outline-none 
            block text-sm 
            --text-black 
            dark:placeholder-gray-400 placeholder-gray-600 
            --bg-slate-100 
            --rounded-xs 
            --focus:ring-blue-500 
            --focus:border-blue-500 
            focus:border
            font-light 
            tracking-wide transition-none
            ${inputClassName}`
          } 
          value={inner_text}
          placeholder={title} 
          // required='' 
          // ref={ref} 
          onBlur={()=>setFocused(false)} 
          onFocus={()=>setFocused(true)} 
          onChange={onChange} 
          {...rest}
        />

        <div sstyle={{direction:'rtl'}} >
          <span 
            children={title} 
            className={`${cls_span} duration-300 
              text-xs font-normal pointer-events-none absolute 
              transition-all left-2`
            }
          />
          { 
            warn && 
            <span 
              className='text-red-600 text-xs' 
              children={` ${warning}`} 
            />
          }
        </div>
      </div>
    )
  }
)
