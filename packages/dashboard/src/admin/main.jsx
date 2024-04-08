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
    Orders, Order, Customers, Customer, 
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
      <Route path='' element={<Posts />} />
      <Route path='q/:query_params' element={<Posts />} />
      <Route path=':id/edit' element={<Post mode='edit' collectionId='posts' />} />
      <Route path=':id/view' element={<Post mode='view' collectionId='posts' />} />
      <Route path='create' element={<Post mode='create' collectionId='posts' /> } />
    </Route>
  </Route>    
  <Route path='pages' element={<Layout className='w-screen h-full' />}>
    <Route path='storefronts'>
      <Route path='' element={<Storefronts />} />
      <Route path='q/:query_params' element={<Storefronts />} />
      <Route path=':id/edit' element={<Storefront collectionId='storefronts' mode='edit' />} />
      <Route path=':id/view' element={<Storefront collectionId='storefronts' mode='view' />} />
      <Route path='create/:base?' element={<Storefront collectionId='storefronts' mode='create' /> } />
    </Route>
    <Route path='customers'>
      <Route path='' element={<Customers />} />
      <Route path='q/:query_params' element={<Customers />} />
      <Route path=':id/edit' element={<Customer mode='edit' />} />
      <Route path=':id/view' element={<Customer mode='view' />} />
      <Route path='create' element={<Customer mode='create' /> } />
    </Route>
    <Route path='tags'>
      <Route path='' element={<Tags />} />
      <Route path='q/:query_params' element={<Tags />} />
      <Route path=':id/edit' element={<Tag mode='edit' />} />
      <Route path=':id/view' element={<Tag mode='view' />} />
      <Route path='create' element={<Tag mode='create' /> } />
    </Route>
    <Route path='products'>
      <Route path='' element={<Products />} />
      <Route path='q/:query_params' element={<Products />} />
      <Route path=':id/edit' element={<Product mode='edit' />} />
      <Route path=':id/view' element={<Product mode='view' />} />
      <Route path='create/:base?' element={<Product mode='create' /> } />
    </Route>
    <Route path='collections'>
      <Route path='' element={<Collections />} />
      <Route path='q/:query_params' element={<Collections />} />
      <Route path=':id/edit' element={<Collection collectionId='collections' mode='edit' />} />
      <Route path=':id/view' element={<Collection collectionId='collections' mode='view' />} />
      <Route path='create/:base?' element={<Collection collectionId='collections' mode='create' /> } />
    </Route>
    <Route path='orders'>
      <Route path='' element={<Orders />} />
      <Route path='q/:query_params' element={<Orders />} />
      <Route path=':id/edit' element={<Order collectionId='orders' mode='edit' />} />
      <Route path=':id/view' element={<Order collectionId='orders' mode='view' />} />
      <Route path='create/:base?' element={<Order collectionId='orders' mode='create' /> } />
    </Route>
    <Route path='discounts'>
      <Route path='' element={<Discounts />} />
      <Route path='q/:query_params' element={<Discounts />} />
      <Route path=':id/edit' element={<Discount collectionId='discounts' mode='edit' />} />
      <Route path=':id/view' element={<Discount collectionId='discounts' mode='view' />} />
      <Route path='create/:base?' element={<Discount collectionId='discounts' mode='create' /> } />
    </Route>
    <Route path='shipping-methods'>
      <Route path='' element={<ShippingMethods />} />
      <Route path='q/:query_params' element={<ShippingMethods />} />
      <Route path=':id/edit' element={<ShippingMethod collectionId='shipping' mode='edit'  segment='shipping-methods'/>} />
      <Route path=':id/view' element={<ShippingMethod collectionId='shipping' mode='view'  segment='shipping-methods'/>} />
      <Route path='create/:base?' element={<ShippingMethod collectionId='shipping' mode='create'  segment='shipping-methods'/> } />
    </Route>
    <Route path='payment-gateways'>
      <Route path='' element={<PaymentGateways />} />
      <Route path='q/:query_params' element={<PaymentGateways />} />
      <Route path=':id/edit' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='edit' />} />
      <Route path=':id/view' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='view' />} />
      <Route path='create/:base?' element={<PaymentGateway collectionId='payment_gateways' segment='payment-gateways' mode='create' /> } />
    </Route>
  </Route>
</Routes>

  )
}