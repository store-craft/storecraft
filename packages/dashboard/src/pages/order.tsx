import { useParams } from 'react-router-dom'
import FieldsView from '@/comps/fields-view'
import OrderDeliveryMethod from '@/comps/order-delivery-method'
import OrderDiscountInfo from '@/comps/order-coupon-info'
import OrderLineItems from '@/comps/order-line-items'
import OrderPrice from '@/comps/order-price'
import ShowIf from '@/comps/show-if'
import { 
  MInput, withCard,
  create_select_view 
} from '@/comps/common-fields'
import DocumentTitle from '@/comps/document-title'
import { RegularDocumentActions } from '@/comps/document-actions'
import ErrorMessage from '@/comps/error-message'
import DocumentDetails from '@/comps/document-details'
import { JsonViewCard } from '@/comps/json'
import OrderPaymentGateway from '@/comps/order-payment-gateway'
import Attributes from '@/comps/attributes'
import TagsEdit from '@/comps/tags-edit'
import MDEditor from '@/comps/md-editor'
import { CreateDate, Div, withBling } from '@/comps/common-ui'
import { PaymentOptionsEnum, FulfillOptionsEnum, 
  CheckoutStatusEnum } from '@storecraft/core/api/types.api.enums.js'
import { DocumentActionsMode, useDocumentActions } from '@/hooks/use-document-actions'
import { useCallback, useMemo } from 'react'
import { OrderData } from '@storecraft/core/api'
import { BaseDocumentContext } from '.'

const contact_schema = {
  name:'🙋🏻‍♂️ Contact Info', key: 'contact', 
  comp: withCard(Div, {className : ''}), 
  comp_params : { className:'w-full'},
  fields: [
    { 
      key: 'email', name: 'Email', type: 'email', 
      validate: true, editable: true, 
      comp: withCard(
        withBling(MInput), { className: 'h-10'}, false
      ), 
      comp_params: {className: 'w-full h-fit mt-5 text-gray-400'} 
    },
    { 
      key: 'firstname', name: 'First Name', type: 'text', 
      validate: true, editable: true, 
      comp: withCard(
        withBling(MInput), { className: 'h-10'}, false
      ), 
      comp_params: {className: 'w-full h-fit mt-5 text-gray-400'} 
    },
    { 
      key: 'lastname', name: 'Last Name', type: 'text', 
      validate: true, editable: true, 
      comp: withCard(
        withBling(MInput), { className: 'h-10'}, false
      ), 
      comp_params: {className: 'w-full h-fit mt-5 text-gray-400'} 
    },
    { 
      key: 'phone_number', name: 'Phone Number', type: 'number', 
      validate: true, editable: true, 
      comp: withCard(
        withBling(MInput), { className: 'h-10', type:'tel'}, false
      ), 
      comp_params: {className: 'w-full h-fit mt-5 text-gray-400'} 
    },
    { 
      key: 'customer_id', name: 'User ID (UID)', type: 'text', 
      validate: false, editable: true, 
      comp: withCard(
        withBling(MInput), { className: 'h-10'}, false
      ), 
      comp_params: {className: 'w-full h-fit mt-5 text-gray-400'} 
    },
  ]
}

const address_schema = {
  name:'✉︎ Address Info', key: 'address', 
  comp: withCard(Div, {className : 'w-full flex flex-row flex-wrap gap-3'}), 
  comp_params : { className:'w-full --lg:w-1/2 '},
  fields: [
    { 
      key: 'firstname', name: 'First Name', type: 'text',  
      validate: false, editable: true, 
      comp: withCard(withBling(MInput), {className : 'h-10 w-full'}, false),  
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'lastname', name: 'Last Name', type: 'text',  
      validate: false, editable: true, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false),  
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'company', name: 'Company', type: 'text',  
      validate: false, editable: true, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false),  
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'street1',  name: 'Street #1', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'}
    },
    { 
      key: 'street2',  name: 'Street #2', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'}
    },
    { 
      key: 'city',  name: 'City', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'}
    },
    { 
      key: 'country',  name: 'Country', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'state',  name: 'State', type: 'text', validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'zip_code',  name: 'ZIP Code', type: 'text', 
      validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'postal_code',  name: 'Postal Code', type: 'text', 
      validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
    { 
      key: 'phone_number',  name: 'Phone Number', type: 'text', 
      validate: false, 
      comp: withCard(withBling(MInput), { className: 'h-10'}, false), 
      comp_params: {className: 'w-full lg:w-[30%] h-fit text-gray-400'} 
    },
   ]
}

const status_schema = {
  name:'☑ Status', key: 'status', 
  comp: withCard(Div, {className : ''}), 
  comp_params : { className:'w-full'},
  fields: [
    { 
      key: 'payment',  name: 'Payment Status', 
      type: 'text', validate: false,
      desc: 'What is the payment status',
      defaultValue: PaymentOptionsEnum.unpaid, 
      comp: withCard(
        withBling(
          create_select_view(Object.values(PaymentOptionsEnum))
        ), 
        { className : 'text-gray-600' }, false
      ),
      comp_params: {className: 'text-gray-500'} 
    }, 
    { 
      key: 'fulfillment',  name: 'Fulfillment Status', 
      type: 'text', validate: false, 
      desc: 'What is the fulfillment status',
      defaultValue: FulfillOptionsEnum.draft, 
      comp: withCard(
        withBling(create_select_view(
          Object.values(FulfillOptionsEnum))
        ), 
        { className : 'text-gray-600'}, false
      ) ,
      comp_params: {className: 'text-gray-500  mt-5'} 
    },
    { 
      key: 'checkout',  name: 'Checkout Status', type: 'text', 
      validate: false, 
      desc: 'How did the costumer complete checkout',
      defaultValue: CheckoutStatusEnum.created, 
      comp: withCard(
        withBling(
          create_select_view(Object.values(CheckoutStatusEnum))
        ), 
        { className : 'text-gray-600'}, false
      ),
      comp_params: { className: 'text-gray-500  mt-5' } 
    },
  ]
}

const right = {
  name:'Right', comp: Div,
  comp_params : { 
    className:'flex flex-col w-full lg:w-[19rem] gap-5' 
  },
  fields: [
    { 
      key: 'pricing',  name: '🧾 Pricing', validate: false, 
      desc: 'Decide the total price of the order including shipping \
      and discounts',
      comp: withCard(OrderPrice, { }), 
      comp_params: {className: 'w-full h-fit'} 
    },
    { 
      key: 'shipping_method', name: '⛟ Delivery Method', type: 'compound', 
      validate: false, editable: true, 
      desc: 'Decide the delivery method',
      comp: withCard(
        OrderDeliveryMethod, 
        { className : 'w-full --bg-red-200 '}
      ),
      comp_params: {className: 'w-full '} 
    },
    { 
      key: 'coupons', name: '🎟️ Coupons', type: 'compound', 
      validate: false, editable: true, 
      desc: 'Which coupons will be applied',
      comp: withCard(
        OrderDiscountInfo, 
        { className : 'w-full --bg-red-200 '}
      ),
      comp_params: {className: 'w-full'} 
    },
    status_schema, 
    { 
      key: 'tags', name: '# Tags', type: 'compund',  
      validate: false, editable: true, 
      desc: 'Tags help you attach small attributes',
      comp: withCard(TagsEdit),
    },
  ]
}


const left = {
  name:'Main', comp: Div, 
  comp_params : { 
    className: `w-full gap-5 items-center 
              lg:items-start lg:w-[35rem] flex flex-col `
            },
  fields: [
    { 
      key: 'payment_gateway', name: '💳 Payments', 
      desc: "Let's see what the payment gateway status is", 
      comp: withCard(
        OrderPaymentGateway, 
        { className : 'w-full  --bg-red-200 '}
      ),
      comp_params: { className: 'w-full text-xs py-auto --font-semibold' } 
    },
    { 
      key: 'line_items', name: '🛍️ Line Items', type: 'compound', 
      validate: false, editable: true, 
      desc: 'Which items are included in the order', 
      defaultValue: [],
      comp: withCard(
        OrderLineItems, { className : 'w-full  --bg-red-200 '}
      ),
      comp_params: {className: 'w-full text-xs py-auto --font-semibold'} 
    },
    contact_schema,
    address_schema,
    {
      key: 'attributes', name: 'Attributes', validate: false, 
      editable: true, 
      desc: 'Attributes can contain richer text values than tags',
      comp: withCard(Attributes),  
      comp_params: {className: 'w-full'} 
    },
    { 
      key: 'notes', name: '🗒 Notes', type: 'text', 
      desc: 'Notes help you add extra information about the order',
      validate: false, editable: true, 
      comp: withCard(MDEditor),  
      comp_params: {className: 'w-full'} 
    },
    {
      name: 'JSON', type: 'compund', validate: false, 
      editable: false, 
      desc: 'Observe the RAW data',
      comp: JsonViewCard,
      comp_params: { className: 'w-full' }
    },
  ]
}

const root_schema = {
  name:'Root', comp: Div, 
  comp_params : { 
    className: `w-full gap-5 --justify-center --bg-red-100 items-center
              lg:max-w-max lg:items-start lg:w-fit flex flex-col
              lg:flex-row --mx-auto`
  },
  fields: [
    left, right
  ]
}

/**
 * Intrinsic state of `order`
 */
export type State = {
    data: OrderData;
    hasChanged: boolean;
};
/**
 * Inner `order` context
 */
export type InnerContext = {
  create_checkout: (gateay: string) => Promise<any>;
};

/**
 * Public `order` context
 */
export type Context = BaseDocumentContext<State> & InnerContext;


export default (
 { 
   mode, ...rest
 }: {
  mode: DocumentActionsMode
 }
) => {

  const { id : documentId, base } = useParams();

  const {
    actions: {
      savePromise, deletePromise, reload, setError,
      duplicate, reload_hard
    },
    context: context_, key, 
    doc, isCreateMode, isEditMode, isViewMode, 
    loading, hasChanged, hasLoaded, error,
    ref_head, ref_root, sdk, op
  } = useDocumentActions(
    'orders', documentId, '/pages/orders', mode, base
  );

  const create_checkout = useCallback(
    /**
     * @param {string} gateway_handle 
     */
    async (gateway_handle) => {
      const doc_after_save = doc;// await savePromise();
      console.log('doc', doc)
      try {
        const response = await sdk.checkout.create(
          doc_after_save, 
          gateway_handle
        );

        const valid_errors = response?.validation;
        console.log('valid_errors', valid_errors)
        if(Boolean(valid_errors?.length)) {
          setError({messages: valid_errors});
          return;
        }

      } catch (e) {
        console.log('e', e)
        setError(e);
        return;
      }

      try {
        await reload(false);
        // await reload_hard.current(false);
        // const order = await reload(false);
        // console.log('order', order)

      } catch(e) {
        console.log('e', e)
      }
    }, [savePromise, setError, sdk, reload, doc]
  );

  const context = useMemo(
    () => {
      return {
        ...context_,
        create_checkout
      }
    }, [context_, create_checkout]
  );

  const duplicate_mod = useCallback(
    () => {
      return duplicate(
        {
          payment_gateway: undefined,
          pricing: undefined,
          line_items: doc.line_items.map(
            li => (
              {
                ...li,
                stock_reserved: 0
              }
            )
          )
        }
      )
    }, [duplicate, doc]
  );

  return (
<div className='w-full lg:min-w-fit mx-auto'>
  <DocumentTitle 
    major={['orders', documentId ?? 'create']} className='' />  
  <DocumentDetails 
    doc={doc} 
    className='mt-5' 
    collectionId={'orders'}/> 
  <RegularDocumentActions 
      id={doc?.id}
      onClickSave={isEditMode ? savePromise : undefined}
      onClickCreate={isCreateMode ? savePromise : undefined}
      onClickDelete={!isCreateMode ? deletePromise : undefined} 
      onClickDuplicate={!isCreateMode ? duplicate_mod : undefined} 
      onClickReload={!isCreateMode ? (async () => reload(false)) : undefined}
      className='mt-5 '/>
  <CreateDate 
      changes_made={hasChanged} ref={ref_head}  
      key={doc?.updated_at}
      time={doc?.created_at} 
      className='mt-8' />            
  <ShowIf show={(hasLoaded && isEditMode) || isCreateMode} >
    <div className='w-full mx-auto '>
      <ErrorMessage 
        error={error} 
        className='w-full' />
      <FieldsView 
        key={key} 
        ref={ref_root} 
        field={root_schema} 
        value={doc ?? {}} 
        context={context}
        isViewMode={isViewMode} 
        className='mt-8 mx-auto' />      
    </div>
  </ShowIf>
</div>
  )
}
