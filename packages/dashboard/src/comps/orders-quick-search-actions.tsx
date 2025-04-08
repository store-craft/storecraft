import { Link } from "react-router-dom"
import { 
  FulfillOptionsEnum, 
  PaymentOptionsEnum 
} from '@storecraft/core/api/types.api.enums.js'
import { LabelCapsule } from "./capsule.js"

export const id2ColorFulfill = (id: number) => {
  switch (id) {
    case 0: return 'bg-gray-400 dark:bg-gray-400/40'
    case 1: return 'bg-red-500 dark:bg-red-500/40'
    case 2: return 'bg-green-600 dark:bg-green-600/40'
    case 3: return 'bg-black dark:bg-black/40'
    default: return 'bg-pink-400 dark:bg-pink-400/40'
  }
}

export const id2ColorPayment = (id: number) => {
  switch (id) {
    case 0: return 'bg-gray-400 dark:bg-gray-400/40'
    case 1: return 'bg-green-500 dark:bg-green-500/40'
    case 2: return 'bg-green-600 dark:bg-green-600/40'
    case 3: return 'bg-kf-400 dark:bg-kf-400/40'
    case 4: return 'bg-malibu-500 dark:bg-malibu-500/40'
    case 5: return 'bg-red-400 dark:bg-red-400/40'
    case 6: return 'bg-cyan-400 dark:bg-cyan-400/40'
    case 7: return 'bg-teal-500 dark:bg-teal-500/40'
    case 8: return 'bg-teal-400 dark:bg-teal-400/40'
    default: return 'bg-pink-400 dark:bg-pink-400/40'

  }
}

const OrdersQuickSearchActions = ({ ...rest }: React.ComponentProps<'div'>) => {

    return (
  <div {...rest}>
    <div className='flex flex-row gap-2 flex-wrap'>
      <Link to={`/pages/orders`} draggable='false'>
        <LabelCapsule 
            value='all' 
            className='border shelf-border-color'
            bgColor='bg-pink-400 dark:bg-pink-400/40' />
      </Link>
      {
        Object.values(FulfillOptionsEnum).map(
          it => (
          <Link 
            key={it.id} 
            draggable='false'
            to={`/pages/orders/q/vql=fulfill:${it.id}`}>
            <LabelCapsule 
              value={it.name2} 
              className='border shelf-border-color'
              bgColor={id2ColorFulfill(it.id)} />
          </Link>
            )
        )
      }
      {
        Object.values(PaymentOptionsEnum).map(
          it => (
            <Link 
              key={it.id} 
              draggable='false'
              to={`/pages/orders/q/vql=payment:${it.id}`}>
              <LabelCapsule 
                value={it.name} 
                className='border shelf-border-color'
                bgColor={id2ColorPayment(it.id)} />
            </Link>
          )
        )
      }
    </div>    
  </div>
    )
  }
  
  export default OrdersQuickSearchActions