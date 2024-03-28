import { withClient } from '../comps/client-only'
import { FaBlogger, FaOpencart } from 'react-icons/fa'
import { AiOutlineUser, AiFillTag } from 'react-icons/ai'
import { TbDiscount2 } from 'react-icons/tb'
import { MdOutlineGamepad, 
         MdOutlineCollectionsBookmark, 
         MdOutlineLocalShipping, 
         MdStorefront } from 'react-icons/md'
import { IoStatsChart } from 'react-icons/io5'
import { IoMdCreate } from 'react-icons/io'
import { AiFillPieChart } from 'react-icons/ai'
import Header from '../comps/home-header'
import Performance from '../comps/home-performace'
import InviteActionCard from '../comps/home-invite-action-card'
import StatCard from '../comps/home-stat-card'

const quick_invite_action_data = [
  { 
    msg : 'Add new Product', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/products/create' 
  },
  { 
    msg : 'Create a new Collection', 
    Icon : <MdOutlineCollectionsBookmark className='text-pink-400 text-2xl'/> , 
    link: '/pages/collections/create' 
  },
  { 
    msg : 'Create a new Store Front', 
    Icon : <MdStorefront className='text-pink-400 text-2xl'/> , 
    link: '/pages/storefronts/create' 
  },
  { 
    msg : 'Create an Order', 
    Icon : <FaOpencart className='text-pink-400 text-2xl'/> , 
    link: '/pages/orders/create' 
  },
  { 
    msg : 'Make a new Discount or Coupon', 
    Icon : <TbDiscount2 className='text-pink-400 text-3xl'/> , 
    link: '/pages/discounts/create' 
  },
  { 
    msg : 'Add a new Shipping method', 
    Icon : <MdOutlineLocalShipping className='text-pink-400 text-3xl'/> , 
    link: '/pages/shipping-methods/create' 
  },
  { 
    msg : 'See latest customers', 
    Icon : <AiOutlineUser className='text-pink-400 text-3xl'/> , 
    link: '/pages/customers' 
  },
  { 
    msg : 'Create reusable Tags', 
    Icon : <AiFillTag className='text-pink-400 text-3xl'/> , 
    link: '/pages/tags/create' 
  },
  { 
    msg : 'Write a Blog post', 
    Icon : <FaBlogger className='text-pink-400 text-3xl'/> , 
    link: '/apps/blog/create' 
  },
]

const stats_data = [
  { 
    msg : 'customers', colId: 'users', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/customers' 
  },
  { 
    msg : 'products', colId: 'products', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/>,
    link: '/pages/products' 
  },
  { 
    msg : 'collections', colId: 'collections', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/collections' 
  },
  { 
    msg : 'unfulfilled orders', colId: 'orders', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/orders/q/search=fulfill:1', search: ['fulfill:1']
  },
  { 
    msg : 'all time orders', colId: 'orders', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/orders' 
  },
  { 
    msg : 'automatic discounts', colId: 'discounts', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/discounts/q/search=app:automatic', search: ['app:automatic'] 
  },
  { 
    msg : 'coupons', colId: 'discounts', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/discounts/q/search=app:manual', search: ['app:manual'] 
  },
  { 
    msg : 'storefronts', colId: 'storefronts', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/storefronts' 
  },
  { 
    msg : 'tags', colId: 'tags', 
    Icon : <MdOutlineGamepad className='text-pink-400 text-3xl'/> , 
    link: '/pages/tags' 
  },
  
]

export default ({ }) => {
  
  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <div className='max-w-[56rem] mx-auto'>
    <Header label='Performance' Icon={IoStatsChart} 
            className='--mt-10 items-baseline' />
    <Performance className='relative w-full h-fit'/>
    <Header label='Stats' Icon={AiFillPieChart} 
            className='mt-20 items-center' />
    <div className='flex flex-row flex-wrap gap-5 justify-left mt-8'>
      {
        stats_data.map((it, ix) => (
          <StatCard key={ix} {...it} />
        ))
      }
    </div>
    <Header label='Quick Actions' Icon={IoMdCreate} 
            className='mt-20 items-center' />
    <div className='flex flex-row flex-wrap gap-5 justify-left mt-8'>
      {
        quick_invite_action_data.map(
          (it, ix) => <InviteActionCard key={ix} {...it} />
        )
      }
    </div>
  </div>
</div>
  )
}
