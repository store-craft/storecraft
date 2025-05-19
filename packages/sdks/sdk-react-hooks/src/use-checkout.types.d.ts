import { 
  AddressType, LineItem, OrderContact, 
  ProductType, ShippingMethodType, CheckoutCreateType
} from "@storecraft/core/api"
import { create_local_storage_hook } from "./use-local-storage.js"
import React, { useCallback } from "react"

/**
 * @description useCart is a custom hook that manages the cart state.
 * This types is the main type of the cart.
 */
export type CheckoutType = CheckoutCreateType;
// export type CheckoutType = {
//   line_items: LineItem[]
//   shipping?: ShippingMethodType
//   coupons?: string[]
//   created_at?: string
//   updated_at?: string
//   id?: string
//   contact?: OrderContact,
//   address?: AddressType,
//   notes?: string,
// }

export type CheckoutEvents = 
  'reset' | 
  'updated' | 
  'create_checkout' | 
  'complete_checkout' | 
  'error' | 
  'set_line_items' | 
  'set_coupons' | 
  'set_shipping' | 
  'set_notes' | 
  'set_address' | 
  'set_contact';

export type CheckoutSubscriber = (event: CheckoutEvents, payload?: any) => void;