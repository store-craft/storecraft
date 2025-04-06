/**
 * @import { TemplateType } from '../api/types.api.js'
 */
import { base64 } from '../crypto/public.js';

/**
 * @description `base64` encoding the templates test helps with drivers
 * such as `D1`, that do not support parameter binding over HTTP
 * @param {string} val 
 */
const base64_encode = val => {
  return 'base64_' + base64.encode(val);
}


/**
 * This data is augmentation / correction of the previous
 * templates that were seeded into the database without `template_subject`.
 * @type {Pick<TemplateType, 'template_subject' | 'id' | 'handle'>[]}
 */
export const templates = [
  {
    "template_subject": base64_encode("Your order ({{order.id}}) was cancelled"),
    "handle": "order-cancelled",
    "id": "template_66f6d007000000986d783f60",
  },


  {
    "template_subject": base64_encode("Your order {{order.id}} was shipped"),
    "handle": "order-shipped",
    "id": "template_66f6cf41000000986d783f5f",
  },



  {
    "template_subject": base64_encode("Confirm password reset"),
    "handle": "forgot-password",
    "id": "template_66faab7f0000004c213e7e65",
  },



  {
    "template_subject": base64_encode("Hi {{customer.firstname}}, Welcome to {{info.general_store_name}}"),
    "handle": "welcome-customer",
    "id": "template_664afed24eba71b9ee185be4",
  },


  {
    "template_subject": base64_encode("Hi {{firstname}}"),
    "handle": "general-message",
    "id": "template_66facc7c0000006785218716",
  },


  {
    "template_subject": base64_encode("Your order {{order.id}} has been received"),
    "handle": "checkout-complete",
    "id": "template_664b15174eba71b9ee185be5",
  },


  {
    "id": "template_67ced90e000000fce2061bfb",
    "handle": "confirm-email",
    "template_subject": base64_encode("Confirm your email address"),
  },


  {
    "id": "template_67cecda4000000f16c0b0036",
    "handle": "general-message-with-action",
    "template_subject": base64_encode("Hi {{message.firstname}}"),
  }  

]