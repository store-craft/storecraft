import {
    HashRouter as Router,
    Routes,
    Route,
    Link,
    Navigate
  } from "react-router-dom"

  import Layout from './layout.jsx'

  import { 
    Home, 
    Orders, Order, Users, User, 
    Tags, Tag, Products, Product, 
    Collections, Collection,
    Discounts, Discount,
    ShippingMethods, ShippingMethod,
    Storefronts, Storefront,
    PaymentGateways, PaymentGateway,
    Settings
  } from './pages/index.jsx'

import {
  Gallery, ImagePage,
  Posts, Post,
} from './apps/index.js'

export default function Main(props) {
  return (
<Routes>
  <Route path='*' element={<Navigate to='home' />} />
  <Route path='home' element={<Layout className='w-screen h-full' children={<Home/>} />} />
  <Route path='settings' element={<Layout className='w-screen h-full' children={<Settings/>} />} />
  <Route path='apps' element={<Layout className='w-screen h-full' />}>
    <Route path='gallery'>
      <Route path='' element={<Gallery />} />
      <Route path='q/:query_params' element={<Gallery />} />
      <Route path='img/:handle' element={<ImagePage />} />
    </Route>
    <Route path='blog'>
      <Route path='' element={<Posts collectionId='posts' />} />
      <Route path='q/:query_params' element={<Posts collectionId='posts' />} />
      <Route path=':id/edit' element={<Post mode='edit' collectionId='posts' />} />
      <Route path=':id/view' element={<Post mode='view' collectionId='posts' />} />
      <Route path='create' element={<Post mode='create' collectionId='posts' /> } />
    </Route>
  </Route>    
  <Route path='pages' element={<Layout className='w-screen h-full' />}>
    <Route path='storefronts'>
      <Route path='' element={<Storefronts collectionId='storefronts' />} />
      <Route path='q/:query_params' element={<Storefronts collectionId='storefronts' />} />
      <Route path=':id/edit' element={<Storefront collectionId='storefronts' mode='edit' />} />
      <Route path=':id/view' element={<Storefront collectionId='storefronts' mode='view' />} />
      <Route path='create/:base?' element={<Storefront collectionId='storefronts' mode='create' /> } />
    </Route>
    <Route path='customers'>
      <Route path='' element={<Users collectionId='users' segment='customers'/>} />
      <Route path='q/:query_params' element={<Users collectionId='users' segment='customers' />} />
      <Route path=':id/edit' element={<User collectionId='users' segment='customers' mode='edit' />} />
      <Route path=':id/view' element={<User collectionId='users' segment='customers' mode='view' />} />
      <Route path='create' element={<User collectionId='users' segment='customers' mode='create' /> } />
    </Route>
    <Route path='tags'>
      <Route path='' element={<Tags collectionId='tags' />} />
      <Route path='q/:query_params' element={<Tags collectionId='tags' />} />
      <Route path=':id/edit' element={<Tag collectionId='tags' mode='edit' />} />
      <Route path=':id/view' element={<Tag collectionId='tags' mode='view' />} />
      <Route path='create' element={<Tag collectionId='tags' mode='create' /> } />
    </Route>
    <Route path='products'>
      <Route path='' element={<Products collectionId='products' />} />
      <Route path='q/:query_params' element={<Products collectionId='products' />} />
      <Route path=':id/edit' element={<Product collectionId='products' mode='edit' />} />
      <Route path=':id/view' element={<Product collectionId='products' mode='view' />} />
      <Route path='create/:base?' element={<Product collectionId='products' mode='create' /> } />
    </Route>
    <Route path='collections'>
      <Route path='' element={<Collections collectionId='collections' />} />
      <Route path='q/:query_params' element={<Collections collectionId='collections' />} />
      <Route path=':id/edit' element={<Collection collectionId='collections' mode='edit' />} />
      <Route path=':id/view' element={<Collection collectionId='collections' mode='view' />} />
      <Route path='create/:base?' element={<Collection collectionId='collections' mode='create' /> } />
    </Route>
    <Route path='orders'>
      <Route path='' element={<Orders collectionId='orders' />} />
      <Route path='q/:query_params' element={<Orders collectionId='orders' />} />
      <Route path=':id/edit' element={<Order collectionId='orders' mode='edit' />} />
      <Route path=':id/view' element={<Order collectionId='orders' mode='view' />} />
      <Route path='create/:base?' element={<Order collectionId='orders' mode='create' /> } />
    </Route>
    <Route path='discounts'>
      <Route path='' element={<Discounts collectionId='discounts' />} />
      <Route path='q/:query_params' element={<Discounts collectionId='discounts' />} />
      <Route path=':id/edit' element={<Discount collectionId='discounts' mode='edit' />} />
      <Route path=':id/view' element={<Discount collectionId='discounts' mode='view' />} />
      <Route path='create/:base?' element={<Discount collectionId='discounts' mode='create' /> } />
    </Route>
    <Route path='shipping-methods'>
      <Route path='' element={<ShippingMethods collectionId='shipping_methods' segment='shipping-methods'/>} />
      <Route path='q/:query_params' element={<ShippingMethods collectionId='shipping_methods' segment='shipping-methods'/>} />
      <Route path=':id/edit' element={<ShippingMethod collectionId='shipping_methods' mode='edit'  segment='shipping-methods'/>} />
      <Route path=':id/view' element={<ShippingMethod collectionId='shipping_methods' mode='view'  segment='shipping-methods'/>} />
      <Route path='create/:base?' element={<ShippingMethod collectionId='shipping_methods' mode='create'  segment='shipping-methods'/> } />
    </Route>
    <Route path='payment-gateways'>
      <Route path='' element={<PaymentGateways collectionId='payment_gateways' segment='payment-gateways'/>} />
      <Route path='q/:query_params' element={<PaymentGateways collectionId='payment_gateways' segment='payment-gateways'/>} />
      <Route path=':id/edit' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='edit' />} />
      <Route path=':id/view' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='view' />} />
      <Route path='create/:base?' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='create' /> } />
    </Route>
  </Route>
</Routes>

  )
}