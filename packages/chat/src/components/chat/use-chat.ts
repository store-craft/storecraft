import { ChatMessage, content_multiple_text_deltas } from "@/components/chat/common.types";
import { content } from "@storecraft/core/ai";
import { useAuth, useStorecraft } from "@storecraft/sdk-react-hooks";
import { useCallback, useEffect, useState } from "react";
import { useIndexDB } from "@/hooks/use-index-db";
import { create_local_storage_hook } from "@/hooks/use-local-storage";
import { demo_1, fixture_chat_1, fixture_chat_orders } from "@/components/chat/chat.fixture";

export type ChatHookConfig = {
  threadId?: string;
}

export type ChatError = {
  type: 'network-error',
  content?: string
} | {
  type: 'load-thread-error',
  content?: string
}

export type ChatPubSubEvent_State = {
  event: 'state',
  payload: {
    loading?: boolean,
    error?: ChatError,
    messages?: ChatMessage[],
    threadId?: string
  }
}

export type ChatPubSubEvents = ChatPubSubEvent_State | {
  event: 'request-retry',
  payload: {
    prompt: content[]
  }
}


export type ChatPubSubSubscriber = (update: ChatPubSubEvents) => void;

class ChatPubSub {
  #subscribers = new Set<ChatPubSubSubscriber>();

  add = (sub: ChatPubSubSubscriber) => {
    this.#subscribers.add(sub);
    return () => { this.#subscribers.delete(sub) }
  } 

  dispatch = (payload: ChatPubSubEvents) => {
    this.#subscribers.forEach(
      sub => { 
        sub(payload);
      }
    )
  }
}

/**
 * @description Current thread chat event bus
 */
export const pubsub = new ChatPubSub();

let err_index = 0;

// "thread_67b75c6e000000cffa74a362"	

const usePreference = create_local_storage_hook<string | undefined>(
  'chat_preference_latest_thread_id',
  undefined
)

/**
 * @description `chat` hook
 * 
 */
export const useChat = (config: ChatHookConfig) => {
  const { sdk } = useStorecraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChatError>();
  const [threadId, setThreadId] = useState<string | undefined>(config?.threadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {state: preference, setState: setPreference} = usePreference();
  const auth = useAuth();

  const {
    error: error_db,
    actions: {
      get: get_db, put: put_db,
    }
  } = useIndexDB<ChatMessage[]>('chat_threads_database');

  useEffect(
    () => {
      if(threadId) {
        // put_db(threadId, messages);
      }
    }, [threadId, messages]
  );

  useEffect(
    () => {
      setPreference(threadId);
    }, [threadId]
  );

  useEffect(
    () => {
      pubsub.dispatch(
        {
          event: 'state',
          payload: {
            error, loading, messages, threadId
          }
        }
      );
    }, [loading, error, messages, threadId]
  );

  const speak = useCallback(
    async (prompt: content[]) => {
      try {

        setError(undefined);
        setLoading(true);
        setMessages(
          (ms) => {
            const base = ms.at(-1)?.role==='user' ? ms.slice(0, -1) : ms;
            return [
              ...base,
              {
                role: 'user',
                contents: prompt
              }
            ]
          }
        );
  
        const response = await sdk.ai.speak(
          'store',
          {
            prompt, 
            thread_id: threadId
          }
        );
        
        setMessages(
          (ms) => [
            ...ms,
            {
              role: 'assistant',
              contents: response.contents
            }
          ]
        );

        if(!response.thread_id) {
          throw new Error('Thread ID is missing from the backend');
        }

        setThreadId(response.thread_id);
      } catch (e) {
        setError(
          {
            type: 'network-error',
            content: String(e)
          }
        );
      } finally {
        setLoading(false);
      }
    }, [threadId]
  );

  const streamSpeak = useCallback(
    async (prompt: content[]) => {
      try {
        
        setError(undefined);
        setLoading(true);
        setMessages(
          (ms) => {
            const base = ms.at(-1)?.role==='user' ? ms.slice(0, -1) : ms;
            return [
              ...base,
              {
                role: 'user',
                contents: prompt
              }
            ]
          }
        );

        {
          // test
          // err_index+=1;
          // if(err_index==2)
          //   throw 'error'
        }
        const {
          threadId: recieved_thread_id,
          generator
        } = await sdk.ai.streamSpeak(
          'store',
          {
            prompt, 
            thread_id: threadId,
            metadata: {
              customer_email: auth?.contact?.email,
              customer_id: auth?.contact?.id?.replace('au_', 'cus_'),
            }
          }
        );
  
        if(!recieved_thread_id) {
          throw new Error('Thread ID is missing from the backend');
        }

        setThreadId(recieved_thread_id);

        const acc: content[] = [];
  
        for await (const content of generator()) {
          acc.push(content);
  
          const agg = aggregate_text_delta_contents(acc);
          
          setMessages(
            (ms) => {
              const base = ms.at(-1)?.role==='assistant' ? 
                ms.slice(0, -1) : ms;
              const new_msgs = [
                ...base,
                {
                  role: 'assistant',
                  contents: agg
                }
              ] as ChatMessage[];
              put_db(recieved_thread_id, new_msgs);
              return new_msgs;
            }
          );
        }

      } catch (e) {
        console.log(e);
        setError(
          {
            type: 'network-error',
            content: String(e)
          }
        );
      } finally {
        setLoading(false);
      }
    }, [threadId, auth]
  );

  const loadThread = useCallback(
    async (thread_id?: string) => {
      setLoading(true);

      try {
        // const messages = thread_id ? (await get_db(thread_id)) : [];

        let messages = []
        if(thread_id) {
          const from_idb = await get_db(thread_id);
          if(from_idb) {
            messages = from_idb;
          } else {
            try {
              const from_storage = await sdk.chats.download(
                thread_id, false
              );
              if(from_storage) {
                messages = from_storage.messages;
                // sync to idb
                await put_db(thread_id, messages);
              }
            } catch (e) {
              console.log(
                `error loading ${thread_id} from server`, e
              );
            }
          }
        }

        setMessages(messages ?? []);
        setThreadId(thread_id);
        setError(undefined);

      } catch (e) {
        setError(
          {
            type: 'load-thread-error',
            content: String(e)
          }
        );

      } finally {
        setLoading(false);
        console.log(thread_id)
        setPreference(thread_id);
      }

    }, []
  );

  const createNewChat = useCallback(
    () => {
      loadThread(undefined);
    }, [loadThread]
  );

  useEffect(
    () => {
      // we give one shot to see latest saved thread in preferences
      // this is why is not in dep list
      const thread_id = config.threadId ?? preference;
      if(thread_id) { 
        loadThread(thread_id);
      };
    }, [config.threadId]
  );

  useEffect(
    () => {
      return pubsub.add(
        (update) => {
          if(update.event==='request-retry') {
            streamSpeak(update.payload.prompt);
          }
        }
      );
    }, [streamSpeak]
  );

  const mm = new Array(20).fill(
    {
      role: 'user',
      contents: [
        {
          type: 'text',
          content: 'Hello, how can I help you today?'
        }
      ]
    }
  )

  // console.log('messages', messages)
  
  return {
    // messages: demo_1, 
    messages, 
    threadId, 
    loading, error, pubsub,
    actions: {
      speak, streamSpeak, createNewChat, 
      loadThread
    }
  }
}


/**
 * @description group `delta-text` contents into it's own 'multiple-delta-text' content,
 * this will help with routing for rendering a specific component. This will work
 * because chat messages are stable via updates.
 * @param message 
 */
export const aggregate_text_delta_contents = (contents: content[]) => {
  const result: (content | content_multiple_text_deltas)[] = [];

  for(const c of (contents ?? [])) {
    if(c.type==='delta_text') {
      if(result.at(-1)?.type!=='multiple-text-deltas') {
        result.push({
          type: 'multiple-text-deltas',
          content: []
        });
      }

      const latest_multiple_deltas = result.at(-1) as content_multiple_text_deltas;
      latest_multiple_deltas.content.push(c);

    } else {
      // push as usual
      result.push(c)
    }
  }

  return result;
}
