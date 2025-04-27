import { Link } from 'react-router-dom'
import { LabelCapsule } from './capsule'
import { discount_types_to_color } from './discounts-table-type'
import { 
  DiscountMetaEnum, DiscountApplicationEnum 
} from '@storecraft/core/api/types.api.enums.js'

const DiscountsQuickSearchActions = 
  ({ ...rest }: React.ComponentProps<'div'>) => {

  return (
<div {...rest}>
  <div className='flex flex-row gap-2 flex-wrap'>
    <Link to={`/pages/discounts`} draggable='false'>
      <LabelCapsule value='all' bgColor='bg-pink-400 dark:bg-pink-400/60' />
    </Link>
    {
      Object.values(DiscountMetaEnum).filter(it => Boolean(it.type)).map(
        it => (
          <Link 
            key={it.id} 
            draggable='false'
            to={`/pages/discounts/q/search=type:${it.id}`}>
            <LabelCapsule 
              value={it.name} 
              bgColor={discount_types_to_color(it.type)} />
          </Link>
        )
      )
    }
  </div>
  <div className='flex flex-row flex-wrap gap-2 mt-1'>
  {
    Object.values(DiscountApplicationEnum).map(
      it => (
        <Link 
          key={it.id} 
          draggable='false'
          to={`/pages/discounts/q/search=app:${it.name.toLowerCase()}`}>
          <LabelCapsule 
            value={it.name} 
            bgColor={discount_types_to_color(undefined)} />
        </Link>
      )
    )
  }
  {
    [{ name: 'enabled', v: true}, { name: 'disabled', v: false}].map(
      (it, ix) => (
      <Link key={ix} 
            draggable='false'
            to={`/pages/discounts/q/search=active:${it.v}`}>
        <LabelCapsule 
            value={it.name} 
            bgColor={discount_types_to_color(undefined)} />
      </Link>
        )
    )
  }
  </div>    
</div>
  )
}

export default DiscountsQuickSearchActions
