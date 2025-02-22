import { content_tool_result } from "@storecraft/core/ai";
import { TOOLS } from "@storecraft/core/ai/agents/agent.tools.js";
import type { withDiv } from "./common.types";
import { ToolResultContent_Products } from "./chat-contents/chat-tool-result-search-products";



export type tool_names = keyof typeof TOOLS;

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

