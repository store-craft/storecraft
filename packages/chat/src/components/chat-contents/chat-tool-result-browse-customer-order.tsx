import { 
  type content_tool_result, type InferToolReturnSchema 
} from "@storecraft/core/ai";
import { type TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { type withDiv } from "../common.types.js";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { ProductsBrowserView } from "./products-browser-view.js";
import { FlashCard } from "../card.js";
import { CustomerOrdersView } from "./customer-orders-view.js";

type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_customer_orders"]>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ToolResult>,
    };
  }
>;

export const ToolResultContent_BrowseCustomerOrders = (
  {
    chat,
  }: Params
) => {
  const { sdk } = useStorecraft();
  const data = chat.content.content.data;
  console.log({data})
  if('error' in data) 
    return null;
  
  const params = chat.content.content.data?.result.params;

  return (
    <>
      {/* <FlashCard card={{ms:3000, border: false}}>
        <div 
          children={params.title} 
          className='w-full flex flex-row justify-center p-1 --border ' />
      </FlashCard> */}

      <CustomerOrdersView 
        chat={undefined}
      />
    </>
  )
}
