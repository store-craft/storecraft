

/**
 * @description Easily `format` errors coming from the `storecraft` backend
 */
export const format_storecraft_errors = (
  error: import('@storecraft/core/api').error
) => {
  return error?.messages?.map(
    it => {
      let msg = '';
      if(it.path) {
        msg += it.path.join('.') + ' - '
      }
      msg += it.message ?? 'Unknown Error';
      return msg;
    }
  ) ?? ['ouch, unexpected error'];
}


export type ErrorsViewProps = {
  errors: string[]
} & React.ComponentProps<'div'>;

export const ErrorsView = (
  {
    errors, ...rest
  } : ErrorsViewProps
) => {

  if(!errors && !errors?.length) {
    return null;
  }

  return (
    <div {...rest}>
      <div 
        className='text-xs tracking-wider 
          text-red-500 bg-red-500/10 border 
          border-red-500 flex flex-col gap-2
          rounded-md p-2 font-mono' 
      >
        {
          errors?.map(
            (it, index) => (
              <div 
                key={index} 
                children={it} 
                className='w-full whitespace-pre-wrap'
              />
            )
          )
        }
      </div>    
    </div>
  )
}