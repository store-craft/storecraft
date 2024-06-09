
export default function Copyright( props ) {
  return (
      <p className='w-full my-10 text-sm font-semibold text-center dark:text-white' 
         {...props} >
        { `All Rights Reserved, SHELF |=| CMS, (${new Date().getFullYear()})` }
      </p>
  )
}

