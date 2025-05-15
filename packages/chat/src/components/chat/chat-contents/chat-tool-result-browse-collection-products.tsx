import { 
  type content_tool_result, type InferToolReturnSchema 
} from "@storecraft/core/ai";
import { type TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import { type withDiv } from "../common.types";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { ProductsBrowserView } from "./products-browser-view.js";
import { FlashCard } from "@/components/common/card.js";

type ToolResult = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_collection_products"]>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result<ToolResult>,
    };
  }
>;

export const ToolResultContent_BrowseCollectionProducts = (
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
  const collection_handle = params.handle;

  if(!Boolean(collection_handle))
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
            products_resource_endpoint: `collections/${collection_handle}/products`,
            tags_fetcher: () => sdk.collections.list_used_products_tags(collection_handle)
          }
        }
      />
    </>
  )
}
