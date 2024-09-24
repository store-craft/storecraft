import { IoTerminal } from "react-icons/io5";
import { CopyableView } from "./copyable-view.jsx";
import { FaTerminal } from "react-icons/fa6";


export const code = `
const app = new App({
  general_store_name: "my-storecraft-app",
  auth_admins_emails: ["john@doe.com"],
})
.withPlatform(new NodePlatform())
.withDatabase(new SQLite())
.withStorage(new NodeLocalStorage())
.withMailer(new MailerSendGrid())
.on(
  'orders/checkout/complete',
  async (event) => {
    const order: orderData = event.payload;
    // send email here
  }
)

await app.init();
await migrateToLatest(app.db, false);

http.createServer(app.handler).listen();
`

export const code_payment = `
const app = new App(config)
.withPlatform(new NodePlatform())
.withDatabase(new MongoDB())
.withStorage(new GoogleStorage())
.withPaymentGateways(
  {
    'stripe': new Stripe(
      { 
        publishable_key: '****', 
        secret_key: '****', 
        webhook_endpoint_secret: '****'
      }
    ),
  }
)
`;

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params
 */
export const NPX = (
  {
    ...rest
  }
) => {

  return (
<div {...rest}>
<CopyableView 
    value={
      <div className='flex flex-row gap-1 items-center'>
        <FaTerminal className='text-base inline'/>npx storecraft create
      </div>
    } 
    copyValue='npx storecraft create'
    process_before_copy={undefined} 
    className={`
      text-gray-200
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
  }
) => {

  return (
    <div {...rest}>
      <div className='rounded-xl w-full h-full z-50
                dark:bg-black bg-gray-100/50 border border-pink-700/10 
                  relative 
                  overflow-clip flex flex-col justify-between p-5 gap-5
                  shadow-[0px_0px_0px] shadow-pink-500/50 dark:shadow-pink-500/90
                
                '
          sstyle={{'box-shadow': '0 0 5px #999'}} children={children}>

      </div>
    </div>
  )
}
