import { 
  forwardRef, useCallback, useEffect, 
  useImperativeHandle, useRef 
} from "react";
import { type ChatMessage, type withDiv } from "./common.types";
import { 
  type ChatMessagesViewImperativeInterface, 
  ChatMessageView 
} from "./chat-message";
import { scroll_snapshop } from "./chat.utils";

export type MessagesParams = withDiv<
  {
    messages: ChatMessage[];
    onChatWindowTouch?: (info?: HTMLDivElement) => void
    onChatWindowScroll?: (info?: HTMLDivElement) => void
    onChatWindowResize?: (el?: HTMLDivElement) => void
  }
>;

export const ChatMessagesView = forwardRef<
  ChatMessagesViewImperativeInterface, MessagesParams
>(
  (
    {
      messages, 
      onChatWindowScroll, 
      onChatWindowResize,
      onChatWindowTouch,
      ...rest
    }: MessagesParams,
    ref
  ) => {
      
    const ref_div = useRef<HTMLDivElement>(undefined);
    const ref_resize_observer_div = useRef<HTMLDivElement>(undefined);

    useImperativeHandle<
      ChatMessagesViewImperativeInterface, 
      ChatMessagesViewImperativeInterface
    >(
      ref,
      () => (
        {
          scroll: () => {
            // console.log('scroll', ref_div.current.scrollHeight)
            ref_div.current?.scroll(
              {
                top: (
                  ref_div.current.scrollHeight - 
                  ref_div.current.clientHeight
                ),
                behavior: "smooth"
              }
            )
          }
        }
      ), []
    );


    const internal_onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        onChatWindowScroll?.(ref_div.current);
      }, [onChatWindowScroll]
    );

    const internal_onTouch: React.UIEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        // console.log('onTouch', e);
        onChatWindowTouch?.(ref_div.current);
      }, [onChatWindowScroll]
    );

    useEffect(
      () => {
        if (!ref_resize_observer_div.current) return;
        const resizeObserver = new ResizeObserver(
          (entries) => {
            // console.log('resize', ref_resize_observer_div.current.clientHeight)
            // console.log('ref_div.current.scrollHeight', ref_div.current.scrollHeight)
            onChatWindowResize?.(ref_resize_observer_div.current);
          }
        );

        resizeObserver.observe(ref_resize_observer_div.current);

        return () => resizeObserver.disconnect();
      }, [onChatWindowResize]
    );
    

    useEffect(
      () => {
        onChatWindowScroll?.(ref_div.current);
      }, [onChatWindowScroll]
    );

    return (
      <div {...rest}>
        <div 
          className='w-full h-full flex flex-col pb-44 
            gap-0 pt-5 --pr-5 overflow-y-scroll'
          onScroll={internal_onScroll}
          onTouchStart={internal_onTouch}
          onMouseDown={internal_onTouch}
          ref={ref_div}
        >
          <div id='__resize_observer' className='w-full h-fit'
              ref={ref_resize_observer_div} >
            {
              messages?.map(
                (m, ix) => (
                  <ChatMessageView 
                    message_index={ix}
                    key={ix} 
                    message={m} 
                    avatar_icon={undefined} 
                  />
                )
              )
            }
          </div>    
        </div>
      </div>
    )
  }
)