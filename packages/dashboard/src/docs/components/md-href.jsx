import Link from 'next/link'

export default function CustomLink({ href, children, ...rest }) {
  // console.log('children ', href)
  return (
    <Link passHref href={href} 
          className='text-teal-600 underline'
          children={children} 
          {...rest} />
  )
}
