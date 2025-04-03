import { content_tool_result } from "@storecraft/core/ai";
import type { TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";
import type { withDiv } from "./common.types";
import { ToolResultContent_Products } from "./chat-contents/chat-tool-result-search-products";
import { ToolResultContent_ShippingMethods } from "./chat-contents/chat-tool-result-fetch-shipping";
import { ToolResultContent_Collections } from "./chat-contents/chat-tool-result-fetch-collections";
import { ToolResultContent_Discounts } from "./chat-contents/chat-tool-result-discounts";
import { ToolResultContent_SimilaritySearch } from "./chat-contents/chat-tool-result-similarity-search";
import { ToolResultContent_BrowseCollectionProducts } from "./chat-contents/chat-tool-result-browse-collection-products";
import { ToolResultContent_BrowseDiscountProducts } from "./chat-contents/chat-tool-result-browse-discount-products";
import { ToolResultContent_BrowseAllProducts } from "./chat-contents/chat-tool-result-browse-all-products";

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
    case 'browse_collection_products':
      return (<ToolResultContent_BrowseCollectionProducts chat={{content}}  />)
    case 'browse_discount_products':
      return (<ToolResultContent_BrowseDiscountProducts chat={{content}}  />)
    case 'browse_all_products':
      return (<ToolResultContent_BrowseAllProducts chat={{content}}  />)
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

