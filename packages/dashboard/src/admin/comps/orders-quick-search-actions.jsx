import { Link } from "react-router-dom"
import { FulfillOptionsEnum, PaymentOptionsEnum } from '../../admin-sdk/js-docs-types'
import { LabelCapsule } from "./capsule"

export const id2ColorFulfill = id => {
  switch (id) {
    case 0: return 'bg-gray-400 dark:bg-gray-400/60'
    case 1: return 'bg-red-500 dark:bg-red-500/60'
    case 2: return 'bg-green-600 dark:bg-green-600/60'
    case 3: return 'bg-black dark:bg-black/60'
    default: return 'bg-pink-400 dark:bg-pink-400/60'
  }
}

export const id2ColorPayment = id => {
  switch (id) {
    case 0: return 'bg-gray-400 dark:bg-gray-400/60'
    case 1: return 'bg-green-500 dark:bg-green-500/60'
    case 2: return 'bg-green-600 dark:bg-green-600/60'
    case 3: return 'bg-kf-400 dark:bg-kf-400/60'
    case 4: return 'bg-malibu-500 dark:bg-malibu-500/60'
    case 5: return 'bg-red-400 dark:bg-red-400/60'
    case 6: return 'bg-cyan-400 dark:bg-cyan-400/60'
    case 7: return 'bg-teal-500 dark:bg-teal-500/60'
    case 8: return 'bg-teal-400 dark:bg-teal-400/60'
    default: return 'bg-pink-400 dark:bg-pink-400/60'

  }
}

const OrdersQuickSearchActions = ({ collectionId='orders', ...rest }) => {

    return (
  <div {...rest}>
    <div className='flex flex-row gap-2 flex-wrap'>
      <Link to={`/pages/${collectionId}`} draggable='false'>
        <LabelCapsule value='all' bgColor='bg-pink-400 dark:bg-pink-400/60' />
      </Link>
      {
        Object.values(FulfillOptionsEnum).map(
          it => (
          <Link key={it.id} 
                draggable='false'
                to={`/pages/${collectionId}/q/search=fulfill:${it.id}`}>
            <LabelCapsule value={it.name2} bgColor={id2ColorFulfill(it.id)} />
          </Link>
            )
        )
      }
      {
        Object.values(PaymentOptionsEnum).map(
          it => (
          <Link key={it.id} 
                draggable='false'
                to={`/pages/${collectionId}/q/search=payment:${it.id}`}>
            <LabelCapsule value={it.name} bgColor={id2ColorPayment(it.id)} />
          </Link>
            )
        )
      }
    </div>    
  </div>
    )
  }
  
  export default OrdersQuickSearchActions