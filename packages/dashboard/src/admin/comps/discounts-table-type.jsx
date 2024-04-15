import { enums } from '@storecraft/core/v-api'
import { useMemo } from 'react'

/**
 * 
 * @param {import('@storecraft/core/v-api').DiscountDetails["meta"]["type"]} type 
 * @returns 
 */
export const discount_types_to_color = type => {
  switch (type) {
    case enums.DiscountMetaEnum.regular.type: return 'bg-teal-600 dark:bg-teal-600/60'
    case enums.DiscountMetaEnum.bulk.type: return 'bg-red-400 dark:bg-red-400/60'
    case enums.DiscountMetaEnum.buy_x_get_y.type: return 'bg-cyan-500 dark:bg-cyan-500/60'
    case enums.DiscountMetaEnum.order.type: return 'bg-kf-400 dark:bg-kf-400/60'
    case enums.DiscountMetaEnum.bundle.type: return 'bg-sky-500 dark:bg-sky-400/60'
    default: return 'bg-slate-400 dark:bg-slate-400/20'
  }
}

/**
 * 
 * @param {import('./collection-view.jsx').CollectionViewComponentParams<
 * import('@storecraft/core/v-api').DiscountDetails["meta"]>} param0 
 * @returns 
 */
const DiscountType = ({ value, ...rest }) => {
  const name = useMemo(() => 
    Object.values(enums.DiscountMetaEnum)
          .find(it => it.type===value?.type)
          ?.name.split(' ')[0], 
          [value])

  const cls = 'text-white rounded-xl py-1 px-2 whitespace-nowrap ' + 
            discount_types_to_color(value?.type)

  return (
<span className={cls + ' bg-'} children={name}/>
  )
}

export default DiscountType