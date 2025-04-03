import Link from 'next/link.js'

export default function CustomLink(
  { 
    href, children, ...rest 
  }
) {
  
  // console.log('children ', href)
  return (
    <Link 
      passHref href={href} 
      className='text-black dark:text-gray-300 hover:text-pink-500 underline underline-offset-4 font-thin'
      children={children} 
      {...rest} 
    />
  )
}
