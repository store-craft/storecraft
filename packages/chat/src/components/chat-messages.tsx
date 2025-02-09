import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ChatMessage, withDiv } from "./common.types";
import svg from './favicon.svg';

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

export const ChatMessageView = (
  {
    message,
    avatar_icon
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 p-5'>
      <img src={'./vite.svg'} 
        className='w-8 h-8 border-1 chat-border-overlay
          rounded-md object-fill bg-cyan-400' />
      <div className='max-w-full flex-1' 
          children={message?.content} />
    </div>
  )
}



export const UserChatMessageView = (
  {
    message,
    avatar_icon
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 px-5 py-2.5 
        max-w-[60%] self-end rounded-3xl chat-card --text-right'>
      <div className='max-w-full flex-1' children={message?.content} />
    </div>
  )
}

export const AssistantChatMessageView = (
  {
    message,
    avatar_icon
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 p-5 self-start'>
      <img src={svg} 
        className='w-8 h-8 border-1 chat-border-overlay
          rounded-md object-fill bg-purple-500/50
          shadow-lg shadow-purple-500/50 ' />
      <div className='max-w-full flex-1' 
          children={message?.content} />
    </div>
  )
}

export const ChatMessageV2View = (
  {
    message,
    avatar_icon
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

export const ChatMessagesView = forwardRef<ChatMessagesViewImperativeInterface, MessagesParams>(
  (
    {
      messages, onChatWindowScroll,
      ...rest
    }: MessagesParams,
    ref
  ) => {
      
    const ref_div = useRef<HTMLDivElement>(undefined);

    useImperativeHandle<ChatMessagesViewImperativeInterface, ChatMessagesViewImperativeInterface>(
      ref,
      () => (
        {
          scroll: () => {
            ref_div.current?.scroll(
              {
                top: ref_div.current.scrollHeight - ref_div.current.clientHeight,
                behavior: "smooth"
              }
            )
          }
        }
      )
    );

    const internal_onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        onChatWindowScroll?.(e.currentTarget);
      }, [onChatWindowScroll]
    );

    useEffect(
      () => {
        onChatWindowScroll?.(ref_div.current)
      }, [onChatWindowScroll]
    );

    return (
      <div {...rest}>
        <div className='w-full h-full flex flex-col pb-44 
              gap-0 p-5 overflow-y-scroll'
            onScroll={internal_onScroll}
            ref={ref_div}>
          {
            messages?.map(
              (m, ix) => (
                <ChatMessageV2View 
                    key={ix} message={m} 
                    avatar_icon={undefined} />
              )
            )
          }
        </div>
      </div>
    )
  }
)