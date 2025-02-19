import { content } from "@storecraft/core/ai";
import type { ChatMessage, content_multiple_text_deltas, withDiv } from "./common.types";
import svg from './favicon.svg';
import { ChatMessageTextContent } from "./chat-message-content-text";
import { ChatMessageTextDeltasContent } from "./chat-message-content-text-deltas";
import ShowIf from "./show-if";
import { ChatPubSubEvent_State, pubsub } from "@/hooks/use-chat";
import { useCallback, useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";


export type MessageParams = withDiv<
  {
    message: ChatMessage;
    message_index: number;
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
    message_index
  }: MessageParams
) => {
  const [chatState, setChatState] = useState<ChatPubSubEvent_State>();
  const show_retry = (
    Boolean(chatState?.payload.error) && 
    !Boolean(chatState?.payload.loading) && 
    message_index==(chatState?.payload.messages?.length ?? 0)-1
  );

  useEffect(
    () => {
      return pubsub.add(
        (update) => {
          if(update.event==='state') {
            setChatState(update);
          }
        }
      )

    }, []
  );

  const onClickRetry = useCallback(
    () => {
      pubsub.dispatch(
        {
          event: 'request-retry',
          payload: {
            prompt: message.contents as content[]
          }
        }
      )
    }, []
  );

  return (
    <div className='w-full h-fit items-end flex flex-col gap-3 '>
      <div className='max-w-[60%] w-fit flex flex-col gap-3 px-5 py-2.5 
                      rounded-3xl chat-card'>
        {
          message.contents?.filter(c => c.type==='text').map(
            (c, ix) => content_to_view(c, ix)
          )
        }
      </div>

      <ShowIf show={show_retry}>
        <button className='cursor-pointer hover:opacity-70 transition-opacity' 
                onClick={onClickRetry}>
          <span children='someting went wrong, retry' 
                className='text-xs  tracking-wider'/>
          <BiRefresh className='inline-block text-lg' />
        </button>
      </ShowIf>

      
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
    message_index
  }: MessageParams
) => {

  const is_user = message.role==='user';

  if(is_user)
    return (<UserChatMessageView message={message} message_index={message_index} />)

  return (
    <AssistantChatMessageView message={message} message_index={message_index} />
  )
}

export type ChatMessagesViewImperativeInterface = {
  scroll: () => void;
}

