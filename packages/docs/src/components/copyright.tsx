

export default function Copyright(props : React.ComponentProps<'p'>) {
  return (
<p 
  className='w-full my-10 h-fit text-sm font-semibold text-center' 
  {...props} >
  { `All Rights Reserved, storecraft, (${new Date().getFullYear()})` }
</p>
  )
}

