import { ChatMessage, content_multiple_text_deltas } from "@/components/common.types";
import { content } from "@storecraft/core/ai";
import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { useCallback, useState } from "react";

/**
 * @description `chat` hook
 * 
 */
export const useChat = () => {
  const { sdk } = useStorecraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const speak = useCallback(
    async (prompt: content[]) => {
      setLoading(true);
      setMessages(
        (ms) => [
          ...ms,
          {
            role: 'user',
            contents: prompt
          }
        ]
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
      setLoading(false);
      setThreadId(threadId ?? response.thread_id);
    }, [threadId]
  );

  const streamSpeak = useCallback(
    async (prompt: content[]) => {
      setLoading(true);
      setMessages(
        (ms) => [
          ...ms,
          {
            role: 'user',
            contents: prompt
          }
        ]
      );

      const {
        threadId: thread_id,
        generator
      } = await sdk.ai.streamSpeak(
        {
          prompt, 
          thread_id: threadId
        }
      );

      console.log(threadId, thread_id)

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
      setLoading(false);
      setThreadId(threadId ?? thread_id);
    }, [threadId]
  );

  return {
    messages, threadId, loading, error,
    actions: {
      speak, streamSpeak
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
