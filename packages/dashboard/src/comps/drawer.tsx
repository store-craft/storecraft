import c from 'classnames'

export type DrawerParams = {
  open?: boolean;
  className?: string;
} & React.ComponentProps<'div'>;


const Drawer = (
  { 
    className, open=true, ...rest 
  }: DrawerParams
) => {

  const cls_ch = c(
    'overflow-hidden h-fit',
    'transition-max-height',
    'ease-linear',
    { 'max-h-[300px]': open},
    {'max-h-0': !open},
    className
  )

  return (
<div className={cls_ch} 
     {...rest}/>
  )
}

export default Drawer