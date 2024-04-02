import c from 'classnames'

/**
 * @typedef {object} InternalDrawerParams
 * @prop {boolean} [open]
 * @prop {string} [className]
 * 
 * @typedef {InternalDrawerParams & 
*  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
* } DrawerParams
* 
* @param {DrawerParams} param
*/
const Drawer = (
  { 
    className, open=true, ...rest 
  }
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