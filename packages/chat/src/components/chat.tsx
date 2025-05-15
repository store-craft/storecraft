import { useCallback, useEffect, useRef, useState } from "react"
import { ChatInputView } from "./chat-input"
import { ChatMessagesView } from "./chat-messages"
import { delta_to_scroll_end } from "./chat.utils"
import { FaArrowDownLong } from "react-icons/fa6";
import useDarkMode from "@/hooks/use-dark-mode"
import { type ChatMessagesViewImperativeInterface } from "./chat-message"
import { useChat } from "@/hooks/use-chat"
import { content } from "@storecraft/core/ai"
import { PoweredBy } from "./powered-by"
import { type withDiv } from "./common.types"
import { HiDuplicate } from "react-icons/hi"
import { sleep } from "@/hooks/sleep"
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { type StorecraftSDKConfig } from "@storecraft/sdk";

export type ChatProps = {
  chat?: {
    /**
     * @description Optional chat id to warm up the chat with.
     * This will try to download the chat history from the server.
     * @example 'chat_1234'
     */
    threadId?: string,
    /**
     * @description Optional Storecraft config to use.
     * You can warm it up with auth token, endpoint, etc.
     */
    storecraft_config?: StorecraftSDKConfig,
    /**
     * @description Optional Apply default background style.
     * If `false`, the chat will not apply the default background style.
     * And you can use your own background style.
     * @default true
     */
    apply_default_background_style?: boolean,
    /**
     * @description Optional Apply default dark mode.
     * @default true
     */
    default_dark_mode?: boolean,
  }
} & React.ComponentProps<'div'>;

export const defaultChatProps: ChatProps["chat"] = {
  threadId: undefined,
  storecraft_config: undefined,
  apply_default_background_style: true,
  default_dark_mode: true,
}

export const Chat = (
  {
    chat,
    className='h-dvh w-screen chat-bg',
    ...rest
  }: ChatProps
) => {

  // apply default nested chat props
  chat = {
    ...defaultChatProps,
    ...chat
  }

  useStorecraft(chat?.storecraft_config);

  const [showScroller, setShowScroller] = useState(false);
  const ref_sticky = useRef(true);
  const ref_current_scroll_pos = useRef({scrollLeft: 0, scrollTop: 0});

  const onChatMessagesWindowResize = useCallback(
    (div?: HTMLDivElement) => {
      if(!ref_sticky.current)
        return;

      if(!div)
        return;

      // console.log('div.clientHeight', div.clientHeight)
      // ref_chat_messages.current?.scroll();
      setTimeout(
        () => ref_chat_messages.current?.scroll(),
        100
      )
      requestAnimationFrame(
        () => {ref_chat_messages.current?.scroll();}
      );

    }, []
  );

  const onChatMessagesScroll = useCallback(
    (div?: HTMLDivElement) => {
      if(!div)
        return;

      const is_scrolling_up = (
        div.scrollTop - 
        ref_current_scroll_pos.current.scrollTop
      ) < 0;
      
      ref_current_scroll_pos.current = {
        scrollLeft: div.scrollLeft, 
        scrollTop: div.scrollTop
      }

      setShowScroller(
        delta_to_scroll_end(div) > 100
      );

    }, []
  );

  const onChatMessagesTouch = useCallback(
    (div?: HTMLDivElement) => {
      if(!div)
        return;
      ref_sticky.current = false;
    }, []
  );  

  const ref_chat_messages = useRef<ChatMessagesViewImperativeInterface>(null);

  const onScrollerClick = useCallback(
    () => {
      ref_sticky.current = true;
      ref_chat_messages.current?.scroll();
    }, []
  );

  useEffect(
    () => {
      requestAnimationFrame(
        () => {ref_chat_messages.current?.scroll();}
      )
    }, []
  );

  const { darkMode } = useDarkMode(chat?.default_dark_mode);
  
  const {
    loading, messages, error, threadId,
    pubsub, actions: {
      speak, streamSpeak, createNewChat
    }
  } = useChat({threadId: chat?.threadId});

  const onSend = useCallback(
    async (contents: content[]) => {
      ref_sticky.current = true;
      // await speak(contents);
      await streamSpeak(contents);
      
    }, [speak]
  );

  // useEffect(
  //   () => {
  //     if(!ref_sticky.current)
  //       return;
  //     setTimeout(
  //       () => ref_chat_messages.current?.scroll(),
  //       2000
  //     )
  //     // ref_chat_messages.current?.scroll()
  //     // requestAnimationFrame(
  //     //   () => {ref_chat_messages.current?.scroll()}
  //     // );
  //   }, [messages]
  // );

 useEffect(
    () => {
      return pubsub.add(
        (update) => {
          if(update.event==='request-retry') {
            ref_sticky.current = true;
          }
        }
      );
    }, []
  );

  const dark_class = darkMode ? 'dark' : '';
  
  return (
    <div 
      className={
        dark_class + ' ' + (
          chat?.apply_default_background_style ? className : ''
        )
      } 
      {...rest}>
      <div 
        className={` -- chat-text w-full 
          h-full flex flex-row justify-center items-center
          font-inter`} >
        <div 
          className='max-w-[800px] w-full h-full relative --bg-red-100 
            flex flex-col gap-0 items-center'>

          <ChatMessagesView 
            messages={messages} 
            onChatWindowScroll={onChatMessagesScroll}
            onChatWindowTouch={onChatMessagesTouch}
            onChatWindowResize={onChatMessagesWindowResize}
            className='w-full h-full '
            ref={ref_chat_messages}
          />

          <button 
            className={`absolute mx-auto rounded-full border 
              transition-all duration-[400ms] cursor-pointer
              chat-bg chat-border-overlay ` + 
              (showScroller ? 'bottom-40' : 'bottom-20')}
            onClick={onScrollerClick}>
            <FaArrowDownLong className='w-6 h-6 m-px p-1' />
          </button>    

          <div className='w-full h-fit absolute bottom-5 px-3'>
            <ChatInputView 
              chat={{onSend, loading, disabled: loading, onNewChat: createNewChat}} 
              className='w-full' />
            <div className='flex flex-row justify-between w-full h-fit mt-2'>
              <ThreadIdView threadId={threadId}/>
              <PoweredBy/>
            </div>
          </div>
        </div>      
      </div>
    </div>
  )
}

const ThreadIdView = (
  {
    threadId, ...rest
  }: withDiv<{threadId?: string}>
) => {
  const [wasCopied, setWasCopied] = useState(false);
  const onClick = useCallback(
    async() => {
      if(!threadId)
        return;
      await navigator.clipboard.writeText(threadId);
      setWasCopied(true);
      await sleep(1500);
      setWasCopied(false);
    }, [threadId]
  );

  if(!threadId)
    return <span />

  return (
    <div 
      className='flex flex-row items-center gap-1 opacity-50 
        hover:opacity-75 transition-opacity cursor-pointer
        font-mono text-[9px]'
      onClick={threadId ? onClick : undefined}>
      <span 
        className='' 
        children={`(${threadId})`}  
      />
      <HiDuplicate className='text-[12px] -translate-y-px' />
      {
        wasCopied && (
          <span children='copied' />
        )
      }
    </div>
  )
}