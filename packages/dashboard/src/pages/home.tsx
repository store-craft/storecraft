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
import Header from '@/comps/home-header'
import Performance from '@/comps/home-performace'
import InviteActionCard from '@/comps/home-invite-action-card'
import StatCard from '@/comps/home-stat-card'

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
    link: '/pages/posts/create' 
  },
] as const;

const stats_data = [
  { 
    msg : 'customers', 
    which_table: 'customers', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/customers' 
  },
  { 
    msg : 'products', 
    which_table: 'products', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/>,
    link: '/pages/products' 
  },
  { 
    msg : 'collections', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    which_table: 'collections', 
    link: '/pages/collections' 
  },
  { 
    msg : 'unfulfilled orders', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/orders/q/vql=fulfill:1', 
    which_table: 'orders', 
    search: 'fulfill:1'
  },
  { 
    msg : 'all time orders', 
    which_table: 'orders', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/orders' 
  },
  { 
    msg : 'automatic discounts', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/discounts/q/vql=app:automatic', 
    which_table: 'discounts', 
    search: 'app:automatic'
  },
  { 
    msg : 'coupons', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/discounts/q/vql=app:manual', 
    which_table: 'discounts', 
    search: 'app:manual' 
  },
  { 
    msg : 'storefronts', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    which_table: 'storefronts', 
    link: '/pages/storefronts' 
  },
  { 
    msg : 'tags', 
    which_table: 'tags', 
    Icon : <MdOutlineGamepad 
    className='text-pink-400 text-3xl'/> , 
    link: '/pages/tags' 
  },
  
] as const;

export default ({}) => {
  
  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <div className='max-w-[56rem] mx-auto'>
    <Header
        label='Performance' 
        Icon={IoStatsChart} 
        iconClassName='text-2xl text-kf-500'
        className='--mt-10 items-baseline' />
    <Performance className='relative w-full h-fit'/>
    <Header 
        label='Statistics' 
        Icon={AiFillPieChart} 
        className='mt-20 items-center' />
    <div className='flex flex-row flex-wrap gap-5 justify-left mt-8'>
      {
      (stats_data).map(
        (it, ix) => (
          <StatCard key={ix} {...it} />
        )
      )
      }
    </div>
    <Header 
        label='Quick Actions' 
        Icon={IoMdCreate} 
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
