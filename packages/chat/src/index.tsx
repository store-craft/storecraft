import './index.css'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { Chat, type ChatProps } from './components/chat/chat'
export { Chat, type ChatProps } from './components/chat/chat';
import { ChatApp, type ChatAppProps } from './components/app';
export { ChatApp, type ChatAppProps } from './components/app';

/**
 * Mounts only the chat component to the given container.
 * There is a dedicated `chat` prop to pass the `threadId` and 
 * `storecraft_config` to the chat component.
 * 
 * ```ts
 * chat: {
 *   threadId: 'thread-id',
 *   storecraft_config: {
 *     endpoint: 'https://api.storecraft.ai',
 *   }
 * }
 * ```
 * 
 * @param container Html Element to mount the chat component.
 * use `document.getElementById('root')` if you are using `pure-html`
 * @param chatProps Container props to pass to the chat component.
 * Also, you have specific props to pass to the chat behaviour.
 */
export const mountStorecraftChat = (
  container?: HTMLElement, 
  chatProps: ChatProps = {}
) => {
  createRoot(
    container ?? document.getElementById('root')!
  ).render(
    <StrictMode>
      <Chat {...chatProps} />
    </StrictMode>,
  )
}


/**
 * Mounts an entire chat app with
 * - chat component.
 * - cart component
 * - threads history.
 * 
 * If you are looking to mount only the chat component,
 * use {@link mountStorecraftChat} instead.
 * 
 * There is a dedicated `chat` prop to pass the `threadId` and 
 * `storecraft_config` to the chat component.
 * 
 * ```ts
 * config: {
 *   chat: {
 *     threadId: 'thread-id',
 *     storecraft_config: {
 *       endpoint: 'https://api.storecraft.ai',
 *     }
 *   }
 * }
 * ```
 * 
 * @param container Html Element to mount the chat component.
 * use `document.getElementById('root')` if you are using `pure-html`
 * @param chatProps Container props to pass to the chat component.
 * Also, you have specific props to pass to the chat behaviour.
 */
export const mountChatApp = (
  container?: HTMLElement, 
  appProps: ChatAppProps = {}
) => {
  createRoot(
    container ?? document.getElementById('root')!
  ).render(
    <StrictMode>
      <ChatApp {...appProps} />
    </StrictMode>,
  )
}

