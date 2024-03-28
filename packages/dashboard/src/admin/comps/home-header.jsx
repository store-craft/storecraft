

const Header = ({label='', Icon, className, iconClassName='inline-block text-kf-500', ...rest}) => {

  return (
<p className={`text-3xl mb-5 shelf-text-title-color shelf-border-color w-full overflow-auto 
              border-b pb-2 flex flex-row gap-2  
              ${className}`}
              {...rest}>
  {Icon && <Icon className={iconClassName} />}
  <span children={label} />
</p>
  )
}

export default Header