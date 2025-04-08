import { GradientText } from "./gradient-text.js"

export type HeaderParams = {
  label?: string;
  Icon?: import('react').FC<{
      className?: string;
  }>;
  className?: string;
  iconClassName?: string;
} & React.ComponentProps<'div'>;

const Header = (
  {
    label='', Icon, className, 
    iconClassName='inline-block text-kf-500', ...rest
  }: HeaderParams
) => {

  return (
<div className={`text-3xl mb-5 shelf-text-title-color 
              shelf-border-color w-full overflow-auto 
              border-b pb-2 flex flex-row gap-2 text-kf-500 
              ${className}`}
              {...rest}>
  {Icon && <Icon className={iconClassName} />}
  {/* <span children={label} /> */}
  <div className='flex flex-row items-baseline text-3xl/none'>
    <GradientText 
        children={label.slice(0,3)}
        className='bg-gradient-to-r from-kf-600 to-pink-500 
        dark:from-kf-600 dark:to-pink-500 --text-5xl 
        uppercase font-medium italic tracking-tighter
        inline-flex --tracking-wide' />
    <GradientText 
        children={label.slice(3)}
        className='bg-gradient-to-r from-pink-600 to-pink-500 
        dark:from-pink-600 dark:to-pink-500 --text-5xl 
        uppercase font-extralight italic tracking-tighter --hidden --text-[34px]
        -translate-x-[3px]
        inline-flex --tracking-wide' />

  </div>

</div>
  )
}

export default Header