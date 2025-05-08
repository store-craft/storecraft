import { Link } from "react-router-dom"
import { 
  FulfillOptionsEnum, 
  PaymentOptionsEnum 
} from '@storecraft/core/api/types.api.enums.js'
import { LabelCapsule } from "./capsule"

type key_fulfill = typeof FulfillOptionsEnum[keyof typeof FulfillOptionsEnum]["name2"];
type key_payment = typeof PaymentOptionsEnum[keyof typeof PaymentOptionsEnum]["name2"];

export const id2ColorFulfill = (key: key_fulfill) => {
  switch (key) {
    case 'draft': return 'bg-gray-400 dark:bg-gray-400/40'
    case 'processing': return 'bg-red-500 dark:bg-red-500/40'
    case 'shipped': return 'bg-green-600 dark:bg-green-600/40'
    case 'fulfilled': return 'bg-black dark:bg-black/40'
    default: return 'bg-pink-400 dark:bg-pink-400/40'
  }
}

export const id2ColorPayment = (key: key_payment) => {
  switch (key) {
    case 'unpaid': return 'bg-gray-400 dark:bg-gray-400/40'
    case 'authorized': return 'bg-green-700/50 dark:bg-green-500/40'
    case 'captured': return 'bg-green-600 dark:bg-green-600/40'
    case 'requires_auth': return 'bg-kf-400/70 dark:bg-kf-400/40'
    case 'voided': return 'bg-malibu-500 dark:bg-malibu-500/40'
    case 'failed': return 'bg-red-400 dark:bg-red-400/40'
    case 'partially_paid': return 'bg-cyan-400 dark:bg-cyan-400/40'
    case 'refunded': return 'bg-teal-500 dark:bg-teal-500/40'
    case 'partially_refunded': return 'bg-teal-800/50 dark:bg-teal-400/40'
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
        Object
        .values(FulfillOptionsEnum)
        .map(
          it => (
          <Link 
            key={it.id} 
            draggable='false'
            to={`/pages/orders/q/search=fulfill:${it.name2}`}>
            <LabelCapsule 
              value={it.name2} 
              className='border shelf-border-color'
              bgColor={id2ColorFulfill(it.name2)} />
          </Link>
            )
        )
      }
      {
        Object
        .values(PaymentOptionsEnum)
        .map(
          it => (
            <Link 
              key={it.id} 
              draggable='false'
              to={`/pages/orders/q/search=payment:${it.name2}`}>
              <LabelCapsule 
                value={it.name} 
                className='border shelf-border-color'
                bgColor={id2ColorPayment(it.name2)} />
            </Link>
          )
        )
      }
    </div>    
  </div>
    )
  }
  
  export default OrdersQuickSearchActions