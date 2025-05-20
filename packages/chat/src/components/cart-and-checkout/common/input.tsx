import { 
  useCallback, useState, 
  useImperativeHandle, forwardRef 
} from 'react'

export type InputProps = {
  input?: {
    type?: React.HTMLInputTypeAttribute | undefined,
    warning?: string,
    title?: string,
    inputClassName?: string,
  }
} & React.ComponentProps<'input'>;

export type InputImperativeinterface = {
  getText: () => string
}

export const Input = forwardRef(
  (
    { 
      input: {
        title='', 
        warning=undefined, 
        inputClassName=''
      }, 
      className, 
      value,
      onChange,
      ...rest 
    }: InputProps, ref: React.ForwardedRef<InputImperativeinterface>
  ) => {

    // const [inner_text, setText] = useState(text)
    const [isFocused, setFocused] = useState(false)

    const cls_span = (isFocused || value!=='') ? 
      'opacity-70 top-1' : 'opacity-0 top-3'
    const cls_input = (isFocused || value!=='') ? 
      'px-2 pt-5' : 'px-2'

    useImperativeHandle(
      ref, 
      () => ({
        getText : () => String(value)
      }),
      [value]
    );

    return (
      <div 
        className={`${className} relative group h-fit`} 
        sstyle={{direction:'rtl'}}>

        <input 
          onWheel={(e) => e.target.blur()}
          className={
            `${cls_input} 
            rounded-md w-full 
            focus:outline-none 
            block text-sm 
            dark:placeholder-gray-400 placeholder-gray-600 
            hover:ring-blue-500 
            focus:border
            font-light 
            tracking-wide transition-none
            ${inputClassName}`
          } 
          value={value}
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
            warning && 
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
