import { 
  useCallback, useEffect, 
  useState } from 'react'
import { PromisableLoadingButton } from './common-button.jsx'
import MDView from './md-view.jsx'
import { HR } from './common-ui.jsx'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { format_storecraft_errors } from './error-message.jsx'


/**
 * 
 * Action button for payment gateway
 * 
 * @typedef {object} ActionButtonParams
 * @prop {import('@storecraft/core/v-api').PaymentGatewayAction} action
 * @prop {(action: import('@storecraft/core/v-api').PaymentGatewayAction) => Promise<void>} onClick
 * 
 * 
 * @param {ActionButtonParams} params
 */
const ActionButton = (
  { 
    action, onClick
  }
) => {

  return (
<PromisableLoadingButton 
    classNameLeft='w-fit'
    title={action.description}
    Icon={undefined} 
    text={action.name} 
    show={true} 
    onClick={() => onClick(action)}
    keep_text_on_load={true}
    classNameLoading='text-xs'
    className='w-fit text-base underline '/>    
  )
}

const NoPaymentGatewayBlues = ({}) => {
  return (
    <p className='text-base' 
      children='No Payment Gateway is linked to this order !!!' />
  )
}

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
  const { comp_params } = field;

  const [status, setStatus] = useState(
    value?.latest_status ?? { messages: [], actions: [] }
  );
  
  const order = context?.data;

  const fetchStatus = useCallback(
    async () => {
      if(value?.gateway_handle===undefined)
        return;
      try {
        const stat = await sdk.payments.paymentStatusOfOrder(
          order.id
        );

        onChange(
          {
            ...value,
            latest_status: stat
          }
        );

        setStatus(stat);

        // setStatus({
        //   "messages": [
        //       `<img  style='height: 1.75rem; display: inline;' src='https://w7.pngwing.com/pngs/294/895/png-transparent-donation-logo-pinballz-paypal-paypal-icon-blue-donation-logo.png'/> paypal`,
        //       "**100.00(ILS)** tried to be `AUTHORIZED`",
        //       "The status is `CREATED`"
        //   ]
        // })

        console.log('stat', stat)

      } catch (e) {
        setError(format_storecraft_errors(e)?.at(0));
      }
    }, [value, order, onChange]
  );

  const invokeAction = useCallback(
    /**
     * 
     * @param {import('@storecraft/core/v-api').PaymentGatewayAction} action 
     */
    async (action) => {
      try {
        const stat = await sdk.payments.invokeAction(
          action.handle, order.id
        );

        onChange(
          {
            ...value,
            latest_status: stat
          }
        );

        setStatus(stat);

        console.log('stat', stat)

      } catch (e) {
        setError(format_storecraft_errors(e)?.at(0));
      }
    }, [value, order, onChange]
  );

  useEffect(
    () => {
      fetchStatus();
    }, []
  );

  if(!value?.gateway_handle)
    return (
      <NoPaymentGatewayBlues />
    )

  return (
<div {...comp_params}>
  <div className='w-full flex flex-row justify-between'>
    <p children='Status' className='text-gray-400 --bg-pink-50 text-xl font-bold'/>
    <PromisableLoadingButton 
        Icon={undefined} 
        text='reload' 
        show={true} 
        keep_text_on_load={true}
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
    {
      status.actions.map(
        (action) => (
          <ActionButton 
            key={action.handle}
            action={action}
            onClick={invokeAction} />
        )
      )
    }
  </div>

</div>
  )
}

export default OrderPaymentGateway