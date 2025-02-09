export type withDiv<Params> = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & Params;

export type ChatMessage = {
  role: 'assistant' | 'user';
  content?: string;
  artifacts?: any[];
}