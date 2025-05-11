import { CopyableView } from "./copyable-view";
import { FaTerminal } from "react-icons/fa6";


export const code2 = `
const app = new App({
  general_store_name: "my-storecraft-app",
  auth_admins_emails: ["john@doe.com"],
})
.withPlatform(new NodePlatform())
.withDatabase(new SQLite())
.withStorage(new NodeLocalStorage())
.withMailer(new SendGrid())
.on(
  'orders/checkout/complete',
  async (event) => {
    const order: orderData = event.payload;
    // send email here
  }
).init();

await migrateToLatest(app.__show_me_everything.db, false);

http.createServer(app.handler).listen();
`;

export const code = `
const app = new App({
  auth_admins_emails: ['tomer.shalev@gmail.com'],
  general_store_name: 'Wush Wush Games',
  // ... MORE Mandatory CONFIG
})
.withPlatform(new NodePlatform())
.withDatabase(new LibSQL())
.withStorage(new NodeLocalStorage())
.withMailer(new Resend())
.withPaymentGateways({
  paypal: new Paypal(),
  stripe: new Stripe(),
})
.withExtensions({
  postman: new PostmanExtension(),
})
.withAI(
  new OpenAI({ model: 'gpt-4o-mini'})
)
.withVectorStore(
  new LibSQLVectorStore({
    embedder: new OpenAIEmbedder(),
  })
)
.withAuthProviders({
  google: new GoogleAuth(),
})
.on(
  'order/checkout/complete',
  async (event) => {
    // send a team slack message
  }
).init();
`;

export const code_payment = `
const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withPaymentGateways(
  {
    stripe: new Stripe(
      { 
        publishable_key: '****', 
        secret_key: '****', 
        webhook_endpoint_secret: '****'
      }
    ),
  }
).init();
`;


export const NPX = (
  {
    ...rest
  } : React.ComponentProps<'div'>
) => {

  return (
<div {...rest}>
  <CopyableView 
    value={
      <div className='flex flex-row gap-1 items-center'>
        <FaTerminal className=' inline'/>npx storecraft create
      </div>
    } 
    copyValue='npx storecraft create'
    process_before_copy={undefined} 
    className={`
      text-gray-200 h-5 sm:h-fit
      shadow-[0px_0px_6px] shadow-pink-500/90
      from-black/60 bg-gradient-to-br to-black 
      rounded-lg flex flex-row justify-between items-center w-fit font-mono`
    }/>
</div>    
  );

}

export const MainCard = (
  {
    children, ...rest
  }: React.ComponentProps<'div'>
) => {

  return (
    <div {...rest}>
      <div 
        className='rounded-xl w-full h-full z-50
        dark:bg-black bg-gray-100/50 border border-pink-700/10 
          relative 
          overflow-clip flex flex-col justify-between p-5 gap-5
          shadow-[0px_0px_0px] shadow-pink-500/50 dark:shadow-pink-500/90'
        // sstyle={{'box-shadow': '0 0 5px #999'}} 
        children={children}>

      </div>
    </div>
  )
}
