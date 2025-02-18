import { content } from "@storecraft/core/ai";
import type { ChatMessage, content_multiple_text_deltas, withDiv } from "./common.types";
import svg from './favicon.svg';
import { ChatMessageTextContent } from "./chat-message-content-text";
import { ChatMessageTextDeltasContent } from "./chat-message-content-text-deltas";


export type MessageParams = withDiv<
  {
    message: ChatMessage;
    avatar_icon?: any;
  }
>;

export type MessagesParams = withDiv<
  {
    messages: ChatMessage[];
    onChatWindowScroll?: (el?: HTMLDivElement) => void
  }
>;

const content_to_view = (content: content | content_multiple_text_deltas, key: React.Key) => {
  switch (content.type) {
    case 'text':
      return (<ChatMessageTextContent chat={{content}} key={key} />)
    case 'multiple-text-deltas':
      return (<ChatMessageTextDeltasContent chat={{content}} key={key} />)
  
    default:
      return null;
  }
}

export const UserChatMessageView = (
  {
    message,
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 px-5 py-2.5 
        max-w-[60%] self-end rounded-3xl chat-card --text-right'>
      <div className='max-w-full flex-1'>
        {
          message.contents?.filter(c => c.type==='text').map(
            (c, ix) => content_to_view(c, ix)
          )
        }
      </div>
    </div>
  )
}


export const AssistantChatMessageView = (
  {
    message,
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 p-5 self-start'>
      <img src={svg} 
        className='w-8 h-8 border-1 chat-border-overlay
          rounded-md object-fill bg-purple-500/50
          shadow-lg shadow-purple-500/50 ' />
        <div className='flex flex-col gap-3'>
        {
          message.contents?.map(
            (c, ix) => content_to_view(c, ix)
          )
        }
        </div>
    </div>
  )
}

export const ChatMessageView = (
  {
    message,
  }: MessageParams
) => {

  const is_user = message.role==='user';

  if(is_user)
    return (<UserChatMessageView message={message} />)

  return (
    <AssistantChatMessageView message={message} />
  )
}

export type ChatMessagesViewImperativeInterface = {
  scroll: () => void;
}

