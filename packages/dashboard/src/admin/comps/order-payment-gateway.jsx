import { useCallback, useEffect, 
  useRef, useState } from 'react'
import { PromisableLoadingButton } from './common-button.jsx'
import MDView from './md-view.jsx'
import { HR } from './common-ui.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { format_storecraft_errors } from './error-message.jsx'

/**
 * 
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *   import('@storecraft/core/v-api').OrderPaymentGatewayData,
 *   import('../pages/order.jsx').Context,
 *   import('@storecraft/core/v-api').OrderData  
 *  > & 
 *   React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } OrderPaymentGatewayParams
 * 
 * @param {OrderPaymentGatewayParams} param
 */
const OrderPaymentGateway = (
  {
    field, value, onChange, setError, context, ...rest
  }
) => {

  const { sdk } = useStorecraft();
  const ref_name = useRef();
  const { key, name, comp_params } = field;

  const [status, setStatus] = useState(value?.latest_status ?? { messages: [] })

  const order = context?.data

  const fetchStatus = useCallback(
    async () => {
      if(value?.gateway_handle===undefined)
        return;
      try {
        const stat = await sdk.payments.paymentStatusOfOrder(
          order.id
        );
        onChange({
          ...value,
          latest_status: stat
        })
        setStatus(stat)

        // setStatus({
        //   "messages": [
        //       `<img  style='height: 1.75rem; display: inline;' src='https://w7.pngwing.com/pngs/294/895/png-transparent-donation-logo-pinballz-paypal-paypal-icon-blue-donation-logo.png'/> paypal`,
        //       "**100.00(ILS)** tried to be `AUTHORIZED`",
        //       "The status is `CREATED`"
        //   ]
        // })

        console.log('stat', stat)

      } catch (e) {
        setError(format_storecraft_errors(e)?.at(0))
      }
    }, [value, order, onChange]
  )

  const capture = useCallback(
    async () => {
      try {
        const stat = await sdk.payment_gateways.capture(
          value.gateway_id, order.id
        )
        onChange({
          ...value,
          latest_status: stat
        })
        setStatus(stat)

        console.log('stat', stat)

      } catch (e) {
        setError(e?.toString())
      }
    }, [value, order, onChange]
  )

  const void_authorized = useCallback(
    async () => {
      try {
        const stat = await sdk.payment_gateways.void(
          value.gateway_id, order.id
        )
        onChange({
          ...value,
          latest_status: stat
        })
        setStatus(stat)

        // console.log('stat', stat)

      } catch (e) {
        setError(e?.toString())
      }
    }, [value, order, onChange]
  )

  const refund = useCallback(
    async () => {
      try {
        const stat = await sdk.payment_gateways.refund(
          value.gateway_id, order.id
        )
        onChange({
          ...value,
          latest_status: stat
        })
        setStatus(stat)

        console.log('stat', stat)

      } catch (e) {
        setError(e?.toString())
      }
    }, [value, order, onChange, setError]
  )

  useEffect(
    () => {
      fetchStatus()
    }, []
  )

  if(value?.gateway_handle===undefined)
    return (
      <p className='text-base' children='No Payment Gateway is linked to this order !!' />
    )

  return (
<div {...comp_params}>
  <div className='w-full flex flex-row justify-between'>
    <p children='Status' className='text-gray-400 --bg-pink-50 text-xl font-bold'/>
    <PromisableLoadingButton Icon={undefined} text='reload' 
                    show={true} keep_text_on_load={true}
                    onClick={fetchStatus}
                    classNameLoading='text-xs'
                    className='w-fit text-base underline shelf-text-label-color'/>

  </div>
  <HR className=''/>
  <ul className='flex md-view rounded-md 
                 flex-col items-start mt-3 w-full h-fit 
                 text-gray-500 text-base'>
    {
      status.messages.map(
        (s, ix) => (
          <MDView value={s} key={ix} />
        )
      )
    }
  </ul>
  <p children='Actions' 
     className='text-gray-400 mt-5 --bg-pink-50 text-xl font-bold'/>
  <HR className='--my-5'/>
  <div className='w-full flex flex-row gap-3 mt-3 shelf-text-label-color'>
    <PromisableLoadingButton Icon={undefined} text='capture' 
                    show={true} 
                    onClick={capture}
                    keep_text_on_load={true}
                    classNameLoading='text-xs'
                    className='w-fit text-base underline '/>
    <PromisableLoadingButton Icon={undefined} text='void' 
                    show={true}
                    onClick={void_authorized}
                    keep_text_on_load={true}
                    classNameLoading='text-xs'
                    className='w-fit text-base underline '/>
    <PromisableLoadingButton Icon={undefined} text='refund' 
                    show={true}
                    onClick={refund}
                    keep_text_on_load={true}
                    classNameLoading='text-xs'
                    className='w-fit text-base underline '/>
  </div>

</div>
  )
}

export default OrderPaymentGateway