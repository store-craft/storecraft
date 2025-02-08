

export const Card = (
  {
    children, 
    ...rest
  }: {
    children?: React.ReactNode
  } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {

  return (
    <div {...rest}>

      <div className='w-full h-full border-1 rounded-lg --p-3 chat-card'>
        {
          children
        }
      </div>
      
    </div>
  )
}