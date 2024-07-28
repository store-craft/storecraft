

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>} props 
 */
export default function Copyright(props) {
  return (
<p 
    className='w-full my-10 h-fit text-sm font-semibold text-center' 
    {...props} >
  { `All Rights Reserved, storecraft, (${new Date().getFullYear()})` }
</p>
  )
}

