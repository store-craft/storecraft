
export const Button = (
  props: React.ComponentProps<'button'> 
) => {

  return (
    <div 
      className='w-full h-12 bg-kf-600 text-white 
      text-lg italic font-semibold rounded-md uppercase
      active:scale-[0.98] flex flex-row justify-center
      items-center 
      tracking-wider cursor-pointer'>
      <button {...props} />
    </div>
  )
}