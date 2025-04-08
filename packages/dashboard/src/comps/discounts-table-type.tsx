import { DiscountDetails, enums } from '@storecraft/core/api'
import { useMemo } from 'react'
import { TableSchemaViewComponentParams } from './table-schema-view'


export const discount_types_to_color = (type: DiscountDetails["meta"]["type"]) => {
  switch (type) {
    case enums.DiscountMetaEnum.regular.type: return 'bg-teal-600 dark:bg-teal-600/40'
    case enums.DiscountMetaEnum.bulk.type: return 'bg-red-400 dark:bg-red-400/40'
    case enums.DiscountMetaEnum.buy_x_get_y.type: return 'bg-cyan-500 dark:bg-cyan-500/40'
    case enums.DiscountMetaEnum.order.type: return 'bg-kf-400 dark:bg-kf-400/40'
    case enums.DiscountMetaEnum.bundle.type: return 'bg-sky-500 dark:bg-sky-400/40'
    default: return 'bg-slate-400 dark:bg-slate-400/20'
  }

}

export type DiscountTypeParams = TableSchemaViewComponentParams<DiscountDetails["meta"]>

const DiscountType = ({ value, ...rest }: DiscountTypeParams) => {
  const name = useMemo(() => 
    Object.values(enums.DiscountMetaEnum)
          .find(it => it.type===value?.type)
          ?.name.split(' ')[0], 
          [value])

  const cls = 'text-white rounded-xl py-px px-2 whitespace-nowrap border shelf-border-color-blend ' + 
            discount_types_to_color(value?.type)

  return (
<span className={cls + ' bg-'} children={name}/>
  )
}

export default DiscountType