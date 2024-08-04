import { 
  useCallback, useEffect, 
  useRef, useState 
} from 'react'
import { PromisableLoadingButton } from './common-button.jsx'
import MDView from './md-view.jsx'
import { HR } from './common-ui.jsx'
import { useCollection, useStorecraft } from '@storecraft/sdk-react-hooks'
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
 * @typedef {object} ChoosePaymentGatewayParams
 * @prop {import('../pages/order.jsx').Context} context
 * 
 * 
 * @param {ChoosePaymentGatewayParams} params 
 */
const ChoosePaymentGateway = (
  {
    context
  }
) => {
  // /**
  //  * @type {import('../hooks/useCollectionsActions.js').HookReturnType<
  //  *  import('@storecraft/core/v-api').PaymentGatewayItemGet>
  //  * }
  //  */ 
  // const { 
  //   context, page, loading, 
  //   error, queryCount, hasLoaded, resource,
  //   resource_is_probably_empty
  // } = useCollectionsActions('payments/gateways', '/pages/payment-gateways');
  
  /**
   * @type {import('@storecraft/sdk-react-hooks').useCollectionHookReturnType<
   *  import('@storecraft/core/v-api').PaymentGatewayItemGet>
   * }
   */
  const { 
    page, error, hasLoaded
  } = useCollection('payments/gateways');
  /** @type {React.LegacyRef<HTMLSelectElement>} */
  const ref_select = useRef();
  const create_promise = useCallback(
    async () => {
      const pg_handle = ref_select.current.value;
      await context.create_checkout(pg_handle);
    }, [context]
  );

  return (
    <div className='w-full h-fit flex flex-col gap-2'>
      <p className='text-base' 
        children='Choose Payment Gateway' />
      <div className='w-full flex flex-row flex-wrap justify-between items-center'>
        <select 
            ref={ref_select}
            name='pg' 
            className='h-8 px-1 rounded-md text-sm 
                      bg-slate-50 dark:bg-slate-800 
                      border shelf-border-color focus:outline-none'>
          {
            page?.map(
              (pg) => (
                <option value={pg.handle} children={pg.info.name} />
              )
            )
          }
        </select>

        <PromisableLoadingButton  
          Icon={undefined} 
          text='create checkout' 
          show={true} 
          onClick={create_promise}
          keep_text_on_load={true}
          classNameLoading='text-xs'
          className='w-fit text-base shelf-text-label-color underline self-end '/>
        
      </div>  

    </div>
  )
}

const PleaseSave = ({}) => {
  return (
    <p className='text-base' 
      children='To create a payment checkout, first save the order' />
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

  if(!value?.gateway_handle) {
    // if(!context.data.id)
    //   return <PleaseSave/>

    return (
      <ChoosePaymentGateway context={context} />
    )
  }

  const buy_link = new URL(
    `/api/payments/buy_ui/${context.data.id}`, 
    sdk.config.endpoint ?? window.location.origin
  );

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
  <div className='flex flex-row items-center justify-between shelf-text-label-color mt-3'>
    <div className='w-fit flex flex-row gap-3 shelf-text-label-color'>
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

    <a
      className='underline w-fit text-base'
      children='buy link' 
      target='_blank'
      href={buy_link.toString()} />

  </div>

</div>
  )
}

export default OrderPaymentGateway