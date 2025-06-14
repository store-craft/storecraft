import { AddressType, LineItem, OrderContact, ProductType, ShippingMethodType } from "@storecraft/core/api"
import { create_local_storage_hook } from "./use-local-storage.js"
import React, { useCallback } from "react"

/**
 * @description useCart is a custom hook that manages the cart state.
 * This types is the main type of the cart.
 */
export type CartType = {
  line_items: LineItem[]
  created_at?: string
  updated_at?: string
  id?: string
}


export type CartEvents = 
  'add_line_item' | 
  'remove_line_item' | 
  'update_line_item' | 
  'clear_cart';

export type CartSubscriber = (event: CartEvents, payload?: any) => void;