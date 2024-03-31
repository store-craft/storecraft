
export default function Copyright( props ) {
  return (
    <div {...props}>
      <p className='w-full py-4 text-sm font-semibold text-center 
                text-gray-400 dark:text-white' >
        { `all rights reserved, shelf cms (${new Date().getFullYear()})` }
      </p>
    </div>  
  )
}

