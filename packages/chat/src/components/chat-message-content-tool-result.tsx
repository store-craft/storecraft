import { content_tool_result } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import type { withDiv } from "./common.types";
import { ToolResultContent_Products } from "./chat-contents/chat-tool-result-search-products";
import { ToolResultContent_ShippingMethods } from "./chat-contents/chat-tool-result-fetch-shipping";
import { ToolResultContent_Collections } from "./chat-contents/chat-tool-result-fetch-collections";
import { ToolResultContent_Discounts } from "./chat-contents/chat-tool-result-discounts";
import { ToolResultContent_SimilaritySearch } from "./chat-contents/chat-tool-result-similarity-search";



export type tool_names = keyof ReturnType<typeof TOOLS>;

export type Params = withDiv<
  {
    chat: {
      content: content_tool_result,
    };
  }
>;

export const content_to_view = (
  content: content_tool_result, 
) => {
  switch (content.content.name as tool_names) {
    case 'login_frontend':
      return 'login frontend view';
    case 'search_products':
      return (<ToolResultContent_Products chat={{content}}  />)
    case 'fetch_shipping_methods':
      return (<ToolResultContent_ShippingMethods chat={{content}}  />)
    case 'fetch_collections':
      return (<ToolResultContent_Collections chat={{content}}  />)
    case 'fetch_discounts':
      return (<ToolResultContent_Discounts chat={{content}}  />)
    case 'search_with_similarity':
      return (<ToolResultContent_SimilaritySearch chat={{content}}  />)
      
    default:
      return null;
  }
}

export const ChatMessageToolResultContent = (
  {
    chat,
  }: Params
) => {

  const view = content_to_view(chat.content);

  if(!view)
      return null;
    
  return (
    <div className='w-full'>
      {
        view
      }
    </div>
    
  )
}

