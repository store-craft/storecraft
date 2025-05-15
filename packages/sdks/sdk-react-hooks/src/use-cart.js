/**
 * @import { LineItem, ProductType, ShippingMethodType } from "@storecraft/core/api"
 * @import { CartType } from "./use-cart.types.js"
 */

import { create_local_storage_hook } from "@storecraft/sdk-react-hooks"
import React, { useCallback } from "react"

/**
 * @type {ReturnType<typeof create_local_storage_hook<CartType>>}
 */
const useCartState = create_local_storage_hook('storecraft_latest_cart');

/**
 * @returns {CartType}
 */
const create_new_cart = () => {
  return {
    line_items: [],
    shipping: undefined,
    coupons: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    id: undefined,
    customer: {
      email: undefined,
      id: undefined
    }
  }
}

/**
 * @description useCart is a custom hook that manages the cart state.
 */
export const useCart = () => {

  const {
    state: cart,
    setState: setCart,
  } = useCartState(create_new_cart());

  const addItem = useCallback(
    /**
     * @description Add an item to the cart
     * @param {ProductType} product 
     * @param {number} [quantity=1] 
     */
    (product, quantity = 1) => {
      const item = cart.line_items.find(
        (item) => item.data.id === product.id
      );
      if(item) {
        item.qty = item.qty + quantity;
      } else {
        cart.line_items.push({
          id: product.id,
          data: product,
          qty: quantity
        });
      }

      setCart(
        {
          ...cart,
          updated_at: new Date().toISOString()
        }
      )
    }, [cart]
  );

  /**
   * @description Remove an item from the cart
   */
  const removeItem = useCallback(
    (product_id_or_handle='') => {
      setCart(
        {
          ...cart,
          line_items: cart.line_items.filter(
            (item) => (
              (item.data.id !== product_id_or_handle) ||
              (item.data.handle !== product_id_or_handle)
            )
          ),
          updated_at: new Date().toISOString()
        }
      )
    }, [cart]
  );

  const setCoupons = useCallback(
    /**
     * @param {string[]} [coupons=[]] 
     */
    (coupons = []) => {
      setCart(
        {
          ...cart,
          coupons: coupons,
          updated_at: new Date().toISOString()
        }
      )
    }, [cart]
  );

  const setShipping = useCallback(
    /**
     * @param {ShippingMethodType} shipping 
     */
    (shipping) => {
      setCart(
        {
          ...cart,
          shipping: shipping,
          updated_at: new Date().toISOString()
        }
      )
    }, [cart]
  );

  const setCustomer = useCallback(
    /**
     * @param {CartType["customer"]} customer 
     */
    (customer) => {
      setCart(
        {
          ...cart,
          customer: customer,
          updated_at: new Date().toISOString()
        }
      )
    }, [cart]
  );

  const clearCart = useCallback(
    () => {
      setCart(
        create_new_cart()
      )
    }, [cart]
  );

  return {
    cart,
    actions: {
      addItem,
      removeItem,
      setCoupons,
      setShipping,
      setCustomer,
      clearCart
    }
  }
}