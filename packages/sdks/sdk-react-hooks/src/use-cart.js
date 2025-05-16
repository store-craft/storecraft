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

  /**
   * @description Add Line iten with quantity to the cart
   */
  const addLineItem = useCallback(
    /**
     * @param {ProductType} product
     * @param {number} quantity
     */
    (product, quantity = 1) => {
      const item = cart.line_items.find(
        (item) => (
          (item.data.id === product.id) || 
          (item.data.handle === product.handle)
        )
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
          line_items: [...cart.line_items],
          updated_at: new Date().toISOString()
        }
      );
    }, [cart]
  );

  // console.log({cart})

  /**
   * @description Remove a line item from the cart
   */
  const removeLineItem = useCallback(
    /**
     * @param {string} product_id_or_handle
     */
    (product_id_or_handle='') => {
      console.log({product_id_or_handle})
      setCart(
        (cart) => ({
          ...cart,
          line_items: cart.line_items.filter(
            (item) => (
              (item.data.id !== product_id_or_handle) &&
              (item.data.handle !== product_id_or_handle)
            )
          ),
          updated_at: new Date().toISOString()
        })
      );

    }, []
  );

  /**
   * @description Update Quantity of an item in the cart
   */
  const updateLineItem = useCallback(
    /**
     * @param {string} product_id_or_handle
     * @param {number} [quantity=1]
     */
    (product_id_or_handle='', quantity = 1) => {
      const item = cart.line_items.find(
        (item) => (
          (item.data.id === product_id_or_handle) || 
          (item.data.handle === product_id_or_handle)
        )
      );

      if(!item) {
        return;
      }

      if(quantity <= 0) {
        removeLineItem(product_id_or_handle);
        return;
      }

      item.qty = quantity;
      
      setCart(
        {
          ...cart,
          updated_at: new Date().toISOString()
        }
      );

    }, [cart, removeLineItem]
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
      );
    }, [cart]
  );

  return {
    cart,
    actions: {
      addLineItem,
      removeLineItem,
      updateLineItem,
      setCoupons,
      setShipping,
      setCustomer,
      clearCart
    }
  }
}