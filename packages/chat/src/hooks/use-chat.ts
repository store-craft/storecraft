import { ChatMessage, content_multiple_text_deltas } from "@/components/common.types";
import { content } from "@storecraft/core/ai";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { useCallback, useEffect, useState } from "react";
import { useIndexDB } from "./use-index-db";
import { create_local_storage_hook } from "./use-local-storage";

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
export const useChat = (config: ChatHookConfig = { threadId: undefined}) => {
  const { sdk } = useStorecraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChatError>();
  const [threadId, setThreadId] = useState<string | undefined>(config.threadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {state: preference, setState: setPreference} = usePreference();

  const {
    error: error_db,
    actions: {
      get: get_db, put: put_db,
    }
  } = useIndexDB<ChatMessage[]>('chat_threads_database');

  useEffect(
    () => {
      if(threadId) {
        put_db(threadId, messages);
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
      console.log('update event')
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
          err_index+=1;
          if(err_index==2)
            throw 'error'
          
        }
        const {
          threadId: thread_id,
          generator
        } = await sdk.ai.streamSpeak(
          {
            prompt, 
            thread_id: threadId
          }
        );
  
        if(!thread_id) {
          throw new Error('Thread ID is missing from the backend');
        }

        setThreadId(thread_id);

        const acc: content[] = [];
  
        for await (const content of generator()) {
          acc.push(content);
  
          const agg = aggregate_text_delta_contents(acc);
          
          setMessages(
            (ms) => {
              const base = ms.at(-1)?.role==='assistant' ? ms.slice(0, -1) : ms;
              return [
                ...base,
                {
                  role: 'assistant',
                  contents: agg
                }
              ]
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
    }, [threadId]
  );

  const loadThread = useCallback(
    async (thread_id?: string) => {
      setLoading(true);

      try {
        const messages = thread_id ? (await get_db(thread_id)) : [];

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

  return {
    messages, threadId, loading, error,
    actions: {
      speak, streamSpeak, createNewChat, loadThread
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
