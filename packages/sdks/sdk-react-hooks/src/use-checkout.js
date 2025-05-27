/**
 * @import { 
 *  CheckoutCreateType, error, HandleOrID, 
 *  LineItem
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
const useCheckoutState = create_local_storage_hook(
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
    suggested: {
      line_items: [],
      shipping_method: undefined,
      coupons: [],
      id: undefined,
      contact: {
        email: undefined,
        customer_id: undefined,
      }
    },
    latest_checkout_attempt: undefined
  }
}

/**
 * @description useCheckout is a custom hook that manages 
 * the checkout state.
 */
export const useCheckout = () => {

  const {
    state: checkout,
    setState: setCheckout,
  } = useCheckoutState(create_new_checkout());
  const [errors, setErrors] = useState(
    /** @type {string[]} */(undefined));
  const [creatingCheckout, setCreatingCheckout] = useState(
    /** @type {boolean} */(false));

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

      setCheckout(
        (prev) => ({
          ...prev,
          suggested: {
            ...prev?.suggested,
            line_items: [...line_items],
          },
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
      setCheckout(
        (prev) => ({
          ...prev,
          suggested: {
            ...prev?.suggested,
            coupons: coupons.map(
              (v) => ({
                handle: v
              })
            ),
          },
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_coupons');
    }, []
  );

  const setShipping = useCallback(
    /**
     * @param {HandleOrID} shipping 
     */
    (shipping) => {
      setCheckout(
        (prev) => ({
          ...prev,
          suggested: {
            ...prev.suggested,
            shipping_method: shipping
          },
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_shipping');
    }, []
  );

  const setContact = useCallback(
    /**
     * @param {CheckoutType["suggested"]["contact"]} contact 
     */
    (contact) => {
      setCheckout(
        (prev) => ({
          ...prev,
          suggested: {
            ...prev.suggested,
            contact: {...contact}
          },
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_contact');
    }, []
  );

  const setAddress = useCallback(
    /**
     * @param {CheckoutType["suggested"]["address"]} address 
     */
    (address) => {
      setCheckout(
        (prev) => ({
          ...prev,
          suggested: {
            ...prev.suggested,
            address: {...address}
          },
          updated_at: new Date().toISOString()
        })
      );
      notify('updated');
      notify('set_address');
    }, []
  );


  const reset = useCallback(
    () => {
      setCheckout(create_new_checkout());
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
        checkout?.suggested
      )
    }, [checkout, sdk]
  );

  /**
   * @description Create a checkout object and buy ui html.
   * @throws {string[]} error messages.
   */
  const createCheckout = useCallback(
    /**
     * @param {CheckoutCreateType} input 
     * @param {string} gateway_handle 
     */
    async (input, gateway_handle) => {
      
      try {

        // throw {
        //   messages: [
        //     {message: 'Not implemented'},
        //     {message: 'Not implemented'},
        //   ]
        // }

        if(creatingCheckout) {
          throw new Error(
            'Already creating checkout, please wait'
          );
        }

        setCreatingCheckout(true);
        setErrors(undefined);

        const checkout_attempt = await sdk.checkout.create(
          {
            // use last checkout id to override for retry
            id: checkout?.latest_checkout_attempt?.id,
            ...(input ?? checkout?.suggested)
          },
          gateway_handle
        );

        if(checkout_attempt.validation?.length) {
          // format as storecraft error
          throw /** @type {error} */({
            messages: checkout_attempt.validation.map(
              it => ({message: it.message})
            )
          });
        } 
        
        notify('create_checkout');
        setCheckout({
          ...checkout,
          latest_checkout_attempt: checkout_attempt,
          updated_at: new Date().toISOString()
        });

        return checkout_attempt;

      } catch(e) {

        const error_messages = e instanceof Error ? 
          [e.message] : format_storecraft_errors(e);

        setErrors(error_messages);
        setCheckout({
          ...checkout,
          latest_checkout_attempt: undefined,
          updated_at: new Date().toISOString()
        });

        notify('error');

        console.error(e);

        throw error_messages;

      } finally {
        setCreatingCheckout(false);
      }

      return undefined;
    }, [checkout, sdk, creatingCheckout]
  );
  

  /**
   * @description (Optional) Complete the checkout process.
   * This is usually invoked at the backend using webhooks.
   */
  const completeCheckout = useCallback(
    /**
     * @param {string} [order_id=undefined] Will use checkout 
     * object if not provided 
     */
    async (order_id=undefined) => {
      try {
        const result = await sdk.checkout.complete(
          order_id ?? checkout?.latest_checkout_attempt?.id
        );

        notify('complete_checkout');

        return result;

      } catch (e) {
        setErrors(format_storecraft_errors(e));
        notify('error');
        console.error(e);
      }

      return undefined;
    }, [checkout, sdk]
  );
    

  /**
   * @description Quick Subtotal of the cart
   * without calculating shipping, taxes and discounts.
   * For better pricing, use the {@link pricing()} method.
   */
  const quickSubTotal = useMemo(
    () => (checkout?.suggested?.line_items ?? []).reduce(
      (acc, item) => {
        return acc + (item.data.price * item.qty);
      }, 0
    ), [checkout]
  );

  /**
   * @description get the number of items in the cart,
   * taking into account the quantity of each item.
   */
  const itemsCount = useMemo(
    () => (checkout?.suggested?.line_items ?? []).reduce(
      (acc, item) => {
        return acc + item.qty;
      }, 0
    ), [checkout]
  );

  const buyUrl = useMemo(
    () => {
      if(!checkout?.latest_checkout_attempt?.id) {
        return undefined;
      }
      return sdk.payments.getBuyUiUrl(
        checkout?.latest_checkout_attempt?.id
      );
    }, [checkout, sdk]
  );
  
  return {
    creatingCheckout,
    errors,
    checkout,
    buyUrl,
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
      suggestedCheckout: checkout?.suggested,
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
