import c from 'classnames'

const Drawer = 
  ({ className, children, maxHeight='max-h-[200px]', open=true, ...rest }) => {

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
     children={children} 
     {...rest}/>
  )
}

export default Drawer