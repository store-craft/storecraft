
export type LabelParams = {
  c: React.ReactNode;
} & React.ComponentProps<'div'>;

export const Lime = (
  { 
    c, children, className, ...rest 
  } : LabelParams
) => {

  return (
<div {...rest}
      children={children ?? c}
      className={`inline w-fit border
        bg-lime-50  text-lime-600 
        dark:bg-lime-50/10 dark:text-lime-500 
        dark:border-none
        rounded-md px-1 ${className}`}/>
  )    
}

export const Purple = (
  { 
    c, children, className, ...rest 
  } : LabelParams
) => {

  return (
<div {...rest}
  children={children ?? c}
  className={`inline w-fit 
              bg-kf-50 border text-kf-500 
              dark:bg-kf-50/10 dark:text-kf-400 
              dark:border-none
              rounded-md px-1 ${className}`}/>
  )    
}

export const Pink = (
  { 
    c, children, className, ...rest 
  } : LabelParams
) => {

  return (
<div {...rest}
  children={children ?? c}
  className={`inline w-fit 
        bg-pink-50 border text-pink-500 
        dark:bg-pink-50/10 dark:text-pink-500 
        dark:border-none
        rounded-md px-1 ${className}`}/>
  )    
}