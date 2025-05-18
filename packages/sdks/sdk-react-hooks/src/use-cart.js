/**
 * @import { 
 *  LineItem, ProductType, ShippingMethodType 
 * } from "@storecraft/core/api"
 * @import { CartEvents, CartSubscriber, CartType } from "./use-cart.types.js"
 */

import { create_local_storage_hook, useStorecraft } from "@storecraft/sdk-react-hooks"
import React, { useCallback, useMemo } from "react"

/**
 * @type {ReturnType<typeof create_local_storage_hook<CartType>>}
 */
const useCartState = create_local_storage_hook('storecraft_latest_cart');

/** @type {Set<CartSubscriber>} */
const subs = new Set();

/**
 * @param {CartSubscriber} cb 
 */
const subscribe = cb => {
  subs.add(cb);
  return () => {
    subs.delete(cb)
  }
}

/**
 * @param {CartEvents} event 
 * @param {any} payload 
 */
const notify = (event, payload) => {
  // console.log(subs)
  subs.forEach(
    cb => cb(event, payload)
  );
}
  

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
      customer_id: undefined,
    }
  }
}

/**
 * @description useCart is a custom hook that manages 
 * the cart state.
 */
export const useCart = () => {

  const {
    state: cart,
    setState: setCart,
  } = useCartState(create_new_cart());
  const {
    sdk
  } = useStorecraft();

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
        item.qty = Math.min(
          item.qty + quantity, item?.data?.qty ?? 0
        );
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
      notify('add_line_item');
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

      notify('remove_line_item');

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

      notify('update_line_item');
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
      notify('clear_cart');
    }, [cart]
  );

  /**
   * @description get the exact pricing of the cart
   * from the backend. This will calculate the 
   * shipping, taxes and discounts (both automatic and coupons).
   */
  const pricing = useCallback(
    () => {
      return sdk.checkout.pricing(
        {
          line_items: cart.line_items,
          shipping_method: cart.shipping,
          coupons: cart.coupons.map(
            (v) => ({
              handle: v
            })
          ),
          contact: cart.customer,
        }
      )
    }, [cart, sdk]
  );

  /**
   * @description Quick Subtotal of the cart
   * without calculating shipping, taxes and discounts.
   * For better pricing, use the {@link pricing()} method.
   */
  const quickSubTotal = useMemo(
    () => cart.line_items.reduce(
      (acc, item) => {
        return acc + (item.data.price * item.qty);
      }, 0
    ), [cart]
  );

  /**
   * @description get the number of items in the cart,
   * taking into account the quantity of each item.
   */
  const itemsCount = useMemo(
    () => cart.line_items.reduce(
      (acc, item) => {
        return acc + item.qty;
      }, 0
    ), [cart]
  );
  
  
  return {
    cart,
    itemsCount,
    quickSubTotal,
    actions: {
      addLineItem,
      removeLineItem,
      updateLineItem,
      setCoupons,
      setShipping,
      setCustomer,
      clearCart,
      pricing,
    },
    events: {
      subscribe,
      notify,
    }
  }
}