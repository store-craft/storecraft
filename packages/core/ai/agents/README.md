# Storecraft AI Agents

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Storecraft has infrastructure to support AI agents, which are
intelligent agents that can perform tasks via many interfaces.

## Storecraft main agents

Currently, there is one agent, called the `store` agent. This agent helps
customers with shopping by
- Searching in their behalf
- Finding products
- Finding discounts
- Finding product information
- performing semantic searches
- Showing product browsers etc...
- Will create a shopping cart for them
- Will checkout for them
- And more...

Every storecraft app is bundled with the store agent.

It is accesible via,
- the `/chat` endpoint, which is a chat interface
- via rest API, which is a REST API interface at 
  - `/api/ai/agents/store/stream` for Server-Sent Events async messages.
  - `/api/ai/agents/store/run` for synchronous messages.
- via the programmatic API

### streaming agent response
```ts
const { 
  thread_id, 
  stream as ReadableStream<content> 
} = await app.api.ai.speakWithAgentStream(
  'store',
  {
    prompt : [
      {
        content : 'Hi, I am looking for super mario games',
        type : 'text'
      }
    ]
  }
);

for await (const chunk of stream) {
  console.log(chunk);
}
```

### non-streaming agent response
```ts
const { 
  thread_id, contents 
} = await app.api.ai.speakWithAgentSync(
  'store',
  {
    prompt : [
      {
        content : 'Hi, I am looking for super mario games',
        type : 'text'
      }
    ]
  }
);

for(const chunk of contents) {
  console.log(chunk);
}
```

## Roll your own agent

You can also roll your own agent. This is useful if you want to create a custom agent.
By implementing the `Agent` interface, you can create your own agent. The agent interface is

```ts
/**
 * @description Response for the `storecraft` agent stream / updates
 */
export type AgentRunStreamResponse = {
  /**
   * @description Current **LLM** formatted responses
   */
  stream: ReadableStream<content>;
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
}

/**
 * @description Response for the `storecraft` agent
 */
export type AgentRunResponse = {
  /**
   * @description Current **LLM** formatted responses
   */
  contents: content[];
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
}

/**
 * @description A general **AI** `agent` interface
 */
export interface Agent {

  init: (app: App) => any | void;

  /**
   * @description Run agent in stream mode
   * @param params agent params
   */
  runStream: (params: AgentRunParameters) => Promise<AgentRunStreamResponse>;

  /**
   * @description Run agent in non-stream mode
   * @param params agent params
   */
  run: (params: AgentRunParameters) => Promise<AgentRunResponse>;

}

```

in the future, there will be a tutorial on how to create your own agent.