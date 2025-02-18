import { content, content_delta_text } from "@storecraft/core/ai";
import type { ChatMessage, content_multiple_text_deltas, withDiv } from "./common.types";
import svg from './favicon.svg';
import { MDView } from "./md-view";

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


export const UserChatMessageView = (
  {
    message,
  }: MessageParams
) => {

  return (
    <div className='w-full h-fit flex flex-row gap-5 px-5 py-2.5 
        max-w-[60%] self-end rounded-3xl chat-card --text-right'>
      <div className='max-w-full flex-1' 
          children={message?.content[0].content} />
    </div>
  )
}

/**
 * @description group `delta-text` contents into it's own 'multiple-delta-text' content,
 * this will help with routing for rendering a specific component. This will work
 * because chat messages are stable via updates.
 * @param message 
 */
export const aggregate_text_delta_contents = (message: ChatMessage) => {
  const result: (content | content_multiple_text_deltas)[] = [];

  for(const c of (message.content ?? [])) {
    if(c.type==='delta_text') {
      if(result.at(-1)?.type!=='delta_text') {
        result.push({
          type: 'multiple-text-deltas',
          content: []
        });
      }

      const latest_multiple_deltas = (result.at(-1) as content_multiple_text_deltas);
      latest_multiple_deltas.content.push(c);

    } else {
      // push as usual
      result.push(c)
    }
  }

  return result;
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
      {/* <div className='max-w-full flex-1' 
          children={message?.content} /> */}
      <MDView value={message?.content[0].content} 
        className='max-w-full flex-1 prose dark:prose-invert
        prose-headings:mt-0 prose-headings:mb-0 prose-p:mt-0' />
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
