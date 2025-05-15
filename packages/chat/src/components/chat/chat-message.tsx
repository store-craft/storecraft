import { type content } from "@storecraft/core/ai";
import { 
  type ChatMessage, type content_multiple_text_deltas, 
  type withDiv 
} from "./common.types";
import svg from '@/components/favicon.svg';
import { ChatMessageTextContent } from "./chat-message-content-text";
import { ChatMessageTextDeltasContent } from "./chat-message-content-text-deltas";
import { ShowBinarySwitch } from "../common/show-if";
import { ChatPubSubEvent_State, pubsub } from "@/hooks/use-chat";
import { useCallback, useEffect, useState } from "react";
import { ChatMessageToolUseContent } from "./chat-message-content-tool-use";
import { ChatMessageToolResultContent } from "./chat-message-content-tool-result";
import { ChatMessageErrorContent } from "./chat-message-content-error";
import { HiRefresh } from "react-icons/hi";


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

const content_to_view = (
  content: content | content_multiple_text_deltas, 
  key: React.Key
) => {
  switch (content.type) {
    case 'text':
      return (<ChatMessageTextContent chat={{content}} key={key} />)
    case 'multiple-text-deltas':
      return (<ChatMessageTextDeltasContent chat={{content}} key={key} />)
    case 'tool_use':
      return (<ChatMessageToolUseContent chat={{content}} key={key} />)
    case 'tool_result':
      return (<ChatMessageToolResultContent chat={{content}} key={key} />)
    case 'error':
      return (<ChatMessageErrorContent chat={{content}} key={key} />)
    
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
    Boolean(chatState?.payload.error?.type==='network-error') && 
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
    <div 
      className='group relative w-full h-fit items-end 
        flex flex-col px-3 gap-3 --pb-10 '>
      <div 
        className=' w-fit max-w-[60%] flex flex-row 
          items-center gap-3'>
        <div 
          className='w-fit flex flex-col gap-3 px-5 py-2.5 
            rounded-3xl chat-card text-right'>
          {
            message.contents?.filter(c => c.type==='text').map(
              (c, ix) => content_to_view(c, ix)
            )
          }
        </div>

      </div>

      <div 
        className={' flex flex-row gap-3 opacity-50 ' + (show_retry ? '' : 'invisible group-hover:visible')}>
        <ShowBinarySwitch toggle={show_retry}>
          <HiRefresh 
            title='retry'
            className='inline-block text-lg cursor-pointer' 
            onClick={onClickRetry} />
            
          <button 
            className='cursor-pointer hover:opacity-70 transition-opacity' 
            onClick={onClickRetry}>
            <span 
              children='something went wrong, retry' 
              className='text-sm px-1 tracking-wider'/>
            <HiRefresh 
              title='retry'
              className='inline-block text-lg cursor-pointer' />
          </button>
        </ShowBinarySwitch>
      </div>


      
    </div>
  )
}


export const AssistantChatMessageView = (
  {
    message, message_index
  }: MessageParams
) => {

  const [remove, setRemove] = useState(false);

  useEffect(
    () => {
      return pubsub.add(
        (update) => {
          if(update.event==='state') {
            if(message_index < (update.payload.messages ?? []).length-1) {
              setRemove(true);
            }
          }
        }
      )
      // sleep(1000).then(() => setRemove(true))
    }, [message_index]
  );

  return (
    <div className='w-full h-fit flex flex-row --gap-5 py-5 --pl-5 self-start'>
      <img src={svg} 
        className={` h-8 chat-border-overlay transition-all duration-400
          rounded-md object-cover bg-purple-500/50 shadow-lg shadow-purple-500/50 
          sm:ml-3 sm:w-8 sm:border-1 w-0 ` + 
          (remove ? 'w-0 sm:w-0 ml-0 border-0' : 'ml-3 sm:w-8 border-0')} />

      <div className='flex flex-col gap-3 px-3 w-full overflow-x-hidden'>
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
    return (
      <UserChatMessageView 
        message={message} 
        message_index={message_index} 
      />
    );

  return (
    <AssistantChatMessageView 
      message={message} 
      message_index={message_index} 
    />
  )
}

export type ChatMessagesViewImperativeInterface = {
  scroll: () => void;
}

