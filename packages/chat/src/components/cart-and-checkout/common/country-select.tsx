import { 
  useState, 
  forwardRef 
} from 'react'
import countries from './countries.json' with {type: 'json'}

export type InputProps = {
  input?: {
    onUpdate?: (text: string) => void,
    text?: string,
    warning?: string,
    title?: string,
    inputClassName?: string,
  }
} & React.ComponentProps<'input'>;

export type InputImperativeinterface = {
  getText: () => string
}

export const CountrySelect = forwardRef(
  (
    { 
      input: {
        title='', warning=undefined, 
        inputClassName=''
      }, className, ...rest 
    }: InputProps, ref: React.ForwardedRef<InputImperativeinterface>
  ) => {

    const [warn, setWarning] = useState(warning)
    const cls_span = 'opacity-50 top-1';
    const cls_input = 'px-2 pt-5';

    return (
      <div 
        className={`${className} relative group h-fit`} 
        sstyle={{direction:'rtl'}}>

        <select 
          className={
            `${cls_input} 
            rounded-md w-full 
            focus:outline-none 
            block text-sm 
            --text-black 
            --placeholder-gray-500 
            --bg-slate-100 
            --rounded-xs 
            --focus:ring-blue-500 
            --focus:border-blue-500 
            focus:border
            font-light 
            tracking-wide transition-none
            ${inputClassName}`
          } 
          // value={'IL'}
          // onBlur={()=>setFocused(false)} 
          // onFocus={()=>setFocused(true)} 

          // ref={ref} 
          // onSelect={onChange} 
          {...rest}
        >
          {
            countries.map((country, index) => (
              <option 
                className='py-1'
                key={index} 
                value={country.code} 
                children={country.name} 
                // selected={country.code === text}
              />
            ))
          }
        </select>

        <div sstyle={{direction:'rtl'}} 
          className={`${cls_span} duration-300 
            text-xs font-normal pointer-events-none absolute 
            transition-all left-3`}>
          <span children={'Country/Region'} />
          { 
            warn && 
            <span 
              className='text-red-500' children={` ${warning}`} 
            />
          }
        </div>
      </div>
    )
  }
)
