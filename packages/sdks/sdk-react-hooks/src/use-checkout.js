/**
 * @import { 
CheckoutCreateType,
 *  LineItem, OrderData, ProductType, ShippingMethodType 
 * } from "@storecraft/core/api"
 * @import { 
 *  CheckoutEvents, CheckoutSubscriber, CheckoutType 
 * } from "./use-checkout.types.js"
 */

import { 
  create_local_storage_hook, useStorecraft 
} from "@storecraft/sdk-react-hooks"
import React, { useCallback, useMemo, useState } from "react"
import { format_storecraft_errors } from "./utils.errors.js";

/** @type {ReturnType<typeof create_local_storage_hook<CheckoutType>>} */
const useSuggestedCheckoutState = create_local_storage_hook(
  'storecraft_latest_checkout');

/** @type {Set<CheckoutSubscriber>} */
const subs = new Set();

/** @param {CheckoutSubscriber} cb */
const subscribe = cb => {
  subs.add(cb);
  return () => {
    subs.delete(cb)
  }
}

/**
 * @param {CheckoutEvents} event 
 * @param {any} payload 
 */
const notify = (event, payload) => {
  // console.log(subs)
  subs.forEach(
    cb => cb(event, payload)
  );
}
  

/** @returns {CheckoutType} */
const create_new_checkout = () => {
  return {
    line_items: [],
    shipping_method: undefined,
    coupons: [],
    id: undefined,
    contact: {
      email: undefined,
      customer_id: undefined,
    }
  }
}

/**
 * @description useCheckout is a custom hook that manages 
 * the checkout state.
 */
export const useCheckout = () => {

  const {
    state: suggestedCheckout,
    setState: setSuggestedCheckout,
  } = useSuggestedCheckoutState(create_new_checkout());
  const [checkout, setCheckout] = useState(
    /** @type {Partial<OrderData>} */(undefined));
  const [errors, setErrors] = useState(
    /** @type {string[]} */(undefined));

  const {
    sdk
  } = useStorecraft();

  /**
   * @description set Line items
   */
  const setLineItems = useCallback(
    /**
     * @param {LineItem[]} line_items
     */
    (line_items) => {

      setSuggestedCheckout(
        (prev) => ({
          ...prev,
          line_items: [...line_items],
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_line_items');
    }, []
  );

  // console.log({cart})


  const setCoupons = useCallback(
    /**
     * @param {string[]} [coupons=[]] 
     */
    (coupons = []) => {
      setSuggestedCheckout(
        (prev) => ({
          ...prev,
          coupons: coupons.map(
            (v) => ({
              handle: v
            })
          ),
        })
      );
      notify('updated');
      notify('set_coupons');
    }, []
  );

  const setShipping = useCallback(
    /**
     * @param {ShippingMethodType} shipping 
     */
    (shipping) => {
      setSuggestedCheckout(
        (prev) => ({
          ...prev,
          shipping: {...shipping},
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_shipping');
    }, []
  );

  const setContact = useCallback(
    /**
     * @param {CheckoutType["contact"]} contact 
     */
    (contact) => {
      setSuggestedCheckout(
        (prev) => ({
          ...prev,
          contact: {...contact},
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_contact');
    }, []
  );

  const setAddress = useCallback(
    /**
     * @param {CheckoutType["address"]} address 
     */
    (address) => {
      setSuggestedCheckout(
        (prev) => ({
          ...prev,
          address: {...address},
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_address');
    }, []
  );


  const reset = useCallback(
    () => {
      setSuggestedCheckout(create_new_checkout());
      setCheckout(undefined);
      notify('updated');
      notify('reset');
    }, []
  );

  /**
   * @description get the exact pricing of the cart
   * from the backend. This will calculate the 
   * shipping, taxes and discounts (both automatic and coupons).
   */
  const pricing = useCallback(
    () => {
      return sdk.checkout.pricing(
        // we actually always pass the complete shipping
        // method, so we can use the suggested checkout
        // althoug it is types to only have the handle or id
        // @ts-ignore
        suggestedCheckout
      )
    }, [suggestedCheckout, sdk]
  );

  /**
   * @description get the exact pricing of the cart
   * from the backend. This will calculate the 
   * shipping, taxes and discounts (both automatic and coupons).
   */
  const createCheckout = useCallback(
    /**
     * @param {CheckoutCreateType} input 
     * @param {string} gateway_handle 
     */
    async (input, gateway_handle) => {
      try {
        const checkout = await sdk.checkout.create(
          input ?? suggestedCheckout,
          gateway_handle
        );
        if(checkout.validation?.length) {
          setErrors(
            checkout.validation.map(
              it => it.title ?? it.message
            )
          );
          notify('error');
        } else {
          setCheckout(checkout);
          notify('create_checkout');
        }

      } catch(e) {
        setErrors(format_storecraft_errors(e));
        notify('error');
        console.error(e);
      }

      return undefined;
    }, [suggestedCheckout, sdk]
  );
  

  /**
   * @description get the exact pricing of the cart
   * from the backend. This will calculate the 
   * shipping, taxes and discounts (both automatic and coupons).
   */
  const completeCheckout = useCallback(
    /**
     * @param {string} [order_id=undefined] Will use checkout 
     * object if not provided 
     */
    async (order_id=undefined) => {
      try {
        const result = await sdk.checkout.complete(
          order_id ?? checkout?.id
        );

        notify('complete_checkout');

        return result;

      } catch (e) {
        setErrors(format_storecraft_errors(e));
        notify('error');
        console.error(e);
      }

      return undefined;
    }, [suggestedCheckout, sdk]
  );
    

  /**
   * @description Quick Subtotal of the cart
   * without calculating shipping, taxes and discounts.
   * For better pricing, use the {@link pricing()} method.
   */
  const quickSubTotal = useMemo(
    () => (suggestedCheckout?.line_items ?? []).reduce(
      (acc, item) => {
        return acc + (item.data.price * item.qty);
      }, 0
    ), [suggestedCheckout]
  );

  /**
   * @description get the number of items in the cart,
   * taking into account the quantity of each item.
   */
  const itemsCount = useMemo(
    () => (suggestedCheckout?.line_items ?? []).reduce(
      (acc, item) => {
        return acc + item.qty;
      }, 0
    ), [suggestedCheckout]
  );
  
  
  return {
    errors,
    checkout,
    itemsCount,
    quickSubTotal,
    /**
     * @description (optional Helper Utility) 
     * get/set the suggested checkout.
     * this is optional, but can be used to aggregate
     * the checkout state across multiple components during
     * the process of checkout.
     * 
     * If {@link createCheckout} is used without arguments,
     * it will use the suggested checkout.
     */
    suggested: {
      suggestedCheckout,
      setLineItems,
      setCoupons,
      setShipping,
      setContact,
      setAddress,
    },
    actions: {
      pricing,
      reset, 
      createCheckout,
      completeCheckout,
    },
    events: {
      subscribe,
      notify,
    }
  }
}