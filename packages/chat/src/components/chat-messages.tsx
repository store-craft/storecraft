import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { ChatMessage, withDiv } from "./common.types";
import { ChatMessagesViewImperativeInterface, ChatMessageView } from "./chat-message";

export type MessagesParams = withDiv<
  {
    messages: ChatMessage[];
    onChatWindowScroll?: (el?: HTMLDivElement) => void
  }
>;

export const ChatMessagesView = forwardRef<
  ChatMessagesViewImperativeInterface, MessagesParams
>(
  (
    {
      messages, onChatWindowScroll,
      ...rest
    }: MessagesParams,
    ref
  ) => {
      
    const ref_div = useRef<HTMLDivElement>(undefined);

    useImperativeHandle<
      ChatMessagesViewImperativeInterface, 
      ChatMessagesViewImperativeInterface
    >(
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
              gap-0 pt-5 pr-5 overflow-y-scroll'
            onScroll={internal_onScroll}
            ref={ref_div}>
          {
            messages?.map(
              (m, ix) => (
                <ChatMessageView 
                    message_index={ix}
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