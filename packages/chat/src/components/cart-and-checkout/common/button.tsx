
export const Button = (
  props: React.ComponentProps<'div'> 
) => {

  return (
    <button 
      className='w-full h-12 bg-kf-600 text-white 
      text-lg italic font-semibold rounded-md uppercase
      active:scale-[0.98] 
      tracking-wider cursor-pointer'>
      <div {...props} />
    </button>
  )
}