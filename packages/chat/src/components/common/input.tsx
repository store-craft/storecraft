import { 
  useState, 
  forwardRef 
} from 'react'

export type InputProps = {
  input?: {
    type?: React.HTMLInputTypeAttribute | undefined,
    warning?: string,
    title?: string,
    inputClassName?: string,
  }
} & React.ComponentProps<'input'>;

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
    }: InputProps, ref: React.ForwardedRef<HTMLInputElement>
  ) => {

    // const [inner_text, setText] = useState(text)
    const [isFocused, setFocused] = useState(false)
    const [isEmpty, setIsEmpty] = useState(
      !Boolean(value ?? rest?.defaultValue ?? '')
    );

    const cls_span = (isFocused || !isEmpty) ? 
      'opacity-70 top-1' : 'opacity-0 top-3';
    const cls_input = (isFocused || !isEmpty) ? 
      'px-2 pt-5' : 'px-2';

    const obChange_internal = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setIsEmpty(!Boolean(value));
      onChange?.(e);
    }

    return (
      <div 
        className={`${className} relative group h-fit`} 
        sstyle={{direction:'rtl'}}>

        <input 
          ref={ref}
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
          onChange={obChange_internal} 
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
