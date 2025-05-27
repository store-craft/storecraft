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

    return (
      <div 
        className={`${className} relative group h-fit`} 
        sstyle={{direction:'rtl'}}>

        <select 
          className={
            `px-2 pt-5
            rounded-md w-full 
            focus:outline-none 
            block text-sm 
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
              />
            ))
          }
        </select>

        <div sstyle={{direction:'rtl'}} 
          className={`top-1 duration-300 
            text-xs font-normal pointer-events-none absolute 
            transition-all left-3`}>
          <span children={'Country/Region'} className='opacity-50' />
          { 
            warning && 
            <span 
              className='text-red-500' children={` ${warning}`} 
            />
          }
        </div>
      </div>
    )
  }
)
