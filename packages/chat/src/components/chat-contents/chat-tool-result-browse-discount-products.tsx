import { 
  type content_tool_result, type InferToolReturnSchema 
} from "@storecraft/core/ai";
import { type TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { type withDiv } from "../common.types.js";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { ProductsBrowserView } from "./products-browser-view.js";
import { Card, FlashCard } from "../card.js";

type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_discount_products"]>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ToolResult>,
    };
  }
>;

export const ToolResultContent_BrowseDiscountProducts = (
  {
    chat,
  }: Params
) => {
  const { sdk } = useStorecraft();
  const data = chat.content.content.data;
  // console.log(data)
  if('error' in data) 
    return null;
  
  const params = chat.content.content.data?.result.params;
  const discount_handle = params.handle;

  if(!Boolean(discount_handle))
    return null;

  return (
    <>
      <FlashCard card={{ms:3000, border: false}}>
        <div 
          children={params.title} 
          className='w-full flex flex-row justify-center p-1 --border ' />
      </FlashCard>
      <ProductsBrowserView 
        chat={
          {
            products_resource_endpoint: `discounts/${discount_handle}/products`,
            tags_fetcher: () => sdk.discounts.list_used_discount_products_tags(discount_handle)
          }
        }
      />
    </>
  )
}
