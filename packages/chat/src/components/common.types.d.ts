import { content, content_delta_text } from "@storecraft/core/ai";

export type withDiv<Params> = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & Params;

export type content_multiple_text_deltas = {
  type: 'multiple-text-deltas',
  content: content_delta_text[]
}

export type ChatMessage<T extends (content)[] = ((content)[])> = {
  role: 'assistant' | 'user';
  content?: T;
}