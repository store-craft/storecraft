
const Header = ({label='', Icon, className, ...rest}) => {

    return (
  <p className={`text-2xl mb-5 w-full overflow-auto --text-gray-500
                border-b shelf-border-color pb-2 flex flex-row gap-2 items-center 
                ${className}`}
                {...rest}>
    {Icon && <Icon className='inline-block text-kf-500' />}
    <span children={label} />
  </p>
    )
  }
  
  export default Header