import { 
  useCallback, useEffect, 
  useRef, useState 
} from 'react'
import { PromisableLoadingButton } from './common-button'
import MDView from './md-view'
import { HR } from './common-ui'
import { useCollection, useStorecraft } from '@storecraft/sdk-react-hooks'
import { format_storecraft_errors } from './error-message'
import { OrderData, OrderPaymentGatewayData, PaymentGatewayAction } from '@storecraft/core/api'
import { FieldLeafViewParams } from './fields-view'

/**
 * Action button for payment gateway
 */
export type ActionButtonParams = {
  action: PaymentGatewayAction;
  onClick: (action: PaymentGatewayAction) => Promise<void>;
};

export type ChoosePaymentGatewayParams = {
  full_order?: OrderData;
  onCreate: (pg_handle: string) => Promise<any>;
};

export type OrderPaymentGatewayParams = FieldLeafViewParams<
  OrderPaymentGatewayData, import('../pages/order.js').Context, 
  import('@storecraft/core/api').OrderData
> & Omit<React.ComponentProps<'div'>, "onChange">;

/**
 * Action button for payment gateway
 */
const ActionButton = (
  { 
    action, onClick
  }: ActionButtonParams
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
      className='w-fit text-base underline '
    />    
  )
}

const NoPaymentGatewayBlues = ({}) => {
  return (
    <p className='text-base' 
      children='No Payment Gateway is linked to this order !!!' />
  )
}

const ChoosePaymentGateway = (
  {
    full_order, onCreate
  }: ChoosePaymentGatewayParams
) => {
  
  const { 
    page, error, hasLoaded
  } = useCollection('payments/gateways');

  const ref_select = useRef<HTMLSelectElement>(undefined);

  if(!full_order?.id)
    return <PleaseSave/>

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
                <option key={pg.handle} value={pg.handle} children={pg.info.name} />
              )
            )
          }
        </select>

        <PromisableLoadingButton  
          Icon={undefined} 
          text='create checkout' 
          show={true} 
          onClick={() => { return onCreate(ref_select.current.value)} }
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

const OrderPaymentGateway = (
  {
    field, value, onChange, setError, context, ...rest
  }: OrderPaymentGatewayParams
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
    async (action: PaymentGatewayAction) => {
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

  const onCreate = useCallback(
    async (pg_handle: string) => {
      // onChange(
      //   {
      //     gateway_handle: pg_handle
      //   }
      // );
      await context.create_checkout(pg_handle);
    }, [context]
  );


  useEffect(
    () => {
      fetchStatus();
    }, []
  );

  if(!value?.gateway_handle) {

    return (
      <ChoosePaymentGateway full_order={order} onCreate={onCreate} />
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
          <MDView value={s} key={ix} 
              className='border-b-2 py-2 stroke-2 dash shelf-border-color border-dashed w-full' />
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
        status?.actions?.map(
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