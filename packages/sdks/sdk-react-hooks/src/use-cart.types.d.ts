import { AddressType, LineItem, OrderContact, ProductType, ShippingMethodType } from "@storecraft/core/api"
import { create_local_storage_hook } from "./use-local-storage.js"
import React, { useCallback } from "react"

/**
 * @description useCart is a custom hook that manages the cart state.
 * This types is the main type of the cart.
 */
export type CartType = {
  line_items: LineItem[]
  shipping?: ShippingMethodType
  coupons?: string[]
  created_at?: string
  updated_at?: string
  id?: string
  customer?: OrderContact,
  address?: AddressType,
  notes?: string,
}
