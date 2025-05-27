import { type content_tool_result, type InferToolReturnSchema } from "@storecraft/core/ai";
import { type ChatMessage } from "./common.types";
import { type TOOLS } from "@storecraft/core/ai/agents/store/agent.tools.js";

type ToolResultOrderBrowser = InferToolReturnSchema<ReturnType<typeof TOOLS>["browse_customer_orders"]>;

export const fixture_chat_orders: ChatMessage[] = [
  {
    role: "user",
    contents: [{type: 'text', content: 'show me the nintendo switch collection'}]
  },
  {
    role: "assistant",
    contents: [
      {
        type: 'tool_result',
        content: {
          name: 'browse_customer_orders',
          data: {
            result: {
              command: 'browse_customer_orders',
              params: {
              }
            }
          }
        }
      }
    ]
  } satisfies ChatMessage<content_tool_result<ToolResultOrderBrowser>>,
]


export const fixture_chat_1: ChatMessage[] = [
  {
    role: "assistant",
    contents: [{type: 'text', content: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti dictumst est placerat tellus platea lacus. Nisl penatibus commodo dis; interdum phasellus iaculis cursus. Arcu conubia quisque lobortis iaculis conubia, penatibus tempus. Enim semper donec arcu conubia maecenas risus. Pretium senectus erat phasellus curabitur nisl rutrum pellentesque.'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'Purus fermentum turpis himenaeos suscipit euismod; orci dui natoque commodo. Ridiculus accumsan erat placerat mus odio ultrices viverra tellus. Neque condimentum convallis odio nascetur habitasse ac odio.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: 'Elit consequat finibus ullamcorper ad, torquent dis. Finibus litora conubia nisi feugiat vel at malesuada pretium. Feugiat praesent eget'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'tempor taciti curabitur tristique lectus.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: 'porta mus lorem rhoncus consectetur. Interdum mauris sollicitudin cras natoque tempor habitasse aptent. Orci penatibus sagittis tincidunt quam imperdiet cubilia.'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'Purus fermentum turpis himenaeos suscipit euismod; orci dui natoque commodo. Ridiculus accumsan erat placerat mus odio ultrices viverra tellus. Neque condimentum convallis odio nascetur habitasse ac odio.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: 'Elit consequat finibus ullamcorper ad, torquent dis. Finibus litora conubia nisi feugiat vel at malesuada pretium. Feugiat praesent eget'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'tempor taciti curabitur tristique lectus.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: 'porta mus lorem rhoncus consectetur. Interdum mauris sollicitudin cras natoque tempor habitasse aptent. Orci penatibus sagittis tincidunt quam imperdiet cubilia.'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'Purus fermentum turpis himenaeos suscipit euismod; orci dui natoque commodo. Ridiculus accumsan erat placerat mus odio ultrices viverra tellus. Neque condimentum convallis odio nascetur habitasse ac odio.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: 'Elit consequat finibus ullamcorper ad, torquent dis. Finibus litora conubia nisi feugiat vel at malesuada pretium. Feugiat praesent eget'}]
  },
  {
    role: "user",
    contents: [{type: 'text', content: 'tempor taciti curabitur tristique lectus.'}]
  },
  {
    role: "assistant",
    contents: [{type: 'text', content: `The Official \`storecraft\` AI Chat 🏆,
- Leveraging \`static rendering\` / \`client side rendering\` / \`swr\`
- Can be deployed into cost effective **CDN**
- Also available at \`jsDelivr\` **CDN**

\`\`\` 
int a = 5;
int a = 5;
int a = 5;
int a = 5;
\`\`\` 
`}]
  }


]


export const demo_1: ChatMessage[] = [
  {
      "role": "user",
      "contents": [
          {
              "type": "text",
              "content": "I would like to know more about Nintendo Switch Games"
          }
      ]
  },
  {
      "role": "assistant",
      "contents": [
          {
              "type": "multiple-text-deltas",
              "content": [
                  {
                      "type": "delta_text",
                      "content": "Let"
                  },
                  {
                      "type": "delta_text",
                      "content": " me"
                  },
                  {
                      "type": "delta_text",
                      "content": " help"
                  },
                  {
                      "type": "delta_text",
                      "content": " you"
                  },
                  {
                      "type": "delta_text",
                      "content": " explore"
                  },
                  {
                      "type": "delta_text",
                      "content": " the"
                  },
                  {
                      "type": "delta_text",
                      "content": " <"
                  },
                  {
                      "type": "delta_text",
                      "content": "collection"
                  },
                  {
                      "type": "delta_text",
                      "content": ">N"
                  },
                  {
                      "type": "delta_text",
                      "content": "intendo"
                  },
                  {
                      "type": "delta_text",
                      "content": " Switch"
                  },
                  {
                      "type": "delta_text",
                      "content": " Games"
                  },
                  {
                      "type": "delta_text",
                      "content": "</"
                  },
                  {
                      "type": "delta_text",
                      "content": "collection"
                  },
                  {
                      "type": "delta_text",
                      "content": ">"
                  },
                  {
                      "type": "delta_text",
                      "content": " from"
                  },
                  {
                      "type": "delta_text",
                      "content": " **"
                  },
                  {
                      "type": "delta_text",
                      "content": "W"
                  },
                  {
                      "type": "delta_text",
                      "content": "ush"
                  },
                  {
                      "type": "delta_text",
                      "content": " W"
                  },
                  {
                      "type": "delta_text",
                      "content": "ush"
                  },
                  {
                      "type": "delta_text",
                      "content": " Games"
                  },
                  {
                      "type": "delta_text",
                      "content": "**.\n\n"
                  }
              ]
          },
          {
              "type": "tool_use",
              "content": [
                  {
                      "name": "browse_collection_products",
                      "id": "call_96084896",
                      "arguments": {
                          "handle": "nintendo-switch-games",
                          "title": "Nintendo Switch Games"
                      },
                      "title": "**browsing** `collection` products"
                  }
              ]
          },
          {
              "type": "tool_result",
              "content": {
                  "data": {
                      "result": {
                          "command": "browse_collection",
                          "params": {
                              "handle": "nintendo-switch-games",
                              "title": "Nintendo Switch Games"
                          }
                      }
                  },
                  "id": "call_96084896",
                  "name": "browse_collection_products"
              }
          },
          {
              "type": "multiple-text-deltas",
              "content": [
                  {
                      "type": "delta_text",
                      "content": "I've"
                  },
                  {
                      "type": "delta_text",
                      "content": " sent"
                  },
                  {
                      "type": "delta_text",
                      "content": " a"
                  },
                  {
                      "type": "delta_text",
                      "content": " command"
                  },
                  {
                      "type": "delta_text",
                      "content": " to"
                  },
                  {
                      "type": "delta_text",
                      "content": " display"
                  },
                  {
                      "type": "delta_text",
                      "content": " all"
                  },
                  {
                      "type": "delta_text",
                      "content": " products"
                  },
                  {
                      "type": "delta_text",
                      "content": " in"
                  },
                  {
                      "type": "delta_text",
                      "content": " the"
                  },
                  {
                      "type": "delta_text",
                      "content": " <"
                  },
                  {
                      "type": "delta_text",
                      "content": "collection"
                  },
                  {
                      "type": "delta_text",
                      "content": ">N"
                  },
                  {
                      "type": "delta_text",
                      "content": "intendo"
                  },
                  {
                      "type": "delta_text",
                      "content": " Switch"
                  },
                  {
                      "type": "delta_text",
                      "content": " Games"
                  },
                  {
                      "type": "delta_text",
                      "content": "</"
                  },
                  {
                      "type": "delta_text",
                      "content": "collection"
                  },
                  {
                      "type": "delta_text",
                      "content": ">"
                  },
                  {
                      "type": "delta_text",
                      "content": " at"
                  },
                  {
                      "type": "delta_text",
                      "content": " **"
                  },
                  {
                      "type": "delta_text",
                      "content": "W"
                  },
                  {
                      "type": "delta_text",
                      "content": "ush"
                  },
                  {
                      "type": "delta_text",
                      "content": " W"
                  },
                  {
                      "type": "delta_text",
                      "content": "ush"
                  },
                  {
                      "type": "delta_text",
                      "content": " Games"
                  },
                  {
                      "type": "delta_text",
                      "content": "**."
                  },
                  {
                      "type": "delta_text",
                      "content": " You'll"
                  },
                  {
                      "type": "delta_text",
                      "content": " be"
                  },
                  {
                      "type": "delta_text",
                      "content": " able"
                  },
                  {
                      "type": "delta_text",
                      "content": " to"
                  },
                  {
                      "type": "delta_text",
                      "content": " browse"
                  },
                  {
                      "type": "delta_text",
                      "content": " through"
                  },
                  {
                      "type": "delta_text",
                      "content": " our"
                  },
                  {
                      "type": "delta_text",
                      "content": " selection"
                  },
                  {
                      "type": "delta_text",
                      "content": " of"
                  },
                  {
                      "type": "delta_text",
                      "content": " cool"
                  },
                  {
                      "type": "delta_text",
                      "content": " retro"
                  },
                  {
                      "type": "delta_text",
                      "content": " and"
                  },
                  {
                      "type": "delta_text",
                      "content": " modern"
                  },
                  {
                      "type": "delta_text",
                      "content": " games"
                  },
                  {
                      "type": "delta_text",
                      "content": " for"
                  },
                  {
                      "type": "delta_text",
                      "content": " the"
                  },
                  {
                      "type": "delta_text",
                      "content": " Nintendo"
                  },
                  {
                      "type": "delta_text",
                      "content": " Switch"
                  },
                  {
                      "type": "delta_text",
                      "content": ".\n\n"
                  },
                  {
                      "type": "delta_text",
                      "content": "If"
                  },
                  {
                      "type": "delta_text",
                      "content": " you"
                  },
                  {
                      "type": "delta_text",
                      "content": " have"
                  },
                  {
                      "type": "delta_text",
                      "content": " any"
                  },
                  {
                      "type": "delta_text",
                      "content": " specific"
                  },
                  {
                      "type": "delta_text",
                      "content": " titles"
                  },
                  {
                      "type": "delta_text",
                      "content": " in"
                  },
                  {
                      "type": "delta_text",
                      "content": " mind"
                  },
                  {
                      "type": "delta_text",
                      "content": " or"
                  },
                  {
                      "type": "delta_text",
                      "content": " need"
                  },
                  {
                      "type": "delta_text",
                      "content": " help"
                  },
                  {
                      "type": "delta_text",
                      "content": " with"
                  },
                  {
                      "type": "delta_text",
                      "content": " anything"
                  },
                  {
                      "type": "delta_text",
                      "content": " else"
                  },
                  {
                      "type": "delta_text",
                      "content": ","
                  },
                  {
                      "type": "delta_text",
                      "content": " just"
                  },
                  {
                      "type": "delta_text",
                      "content": " let"
                  },
                  {
                      "type": "delta_text",
                      "content": " me"
                  },
                  {
                      "type": "delta_text",
                      "content": " know"
                  },
                  {
                      "type": "delta_text",
                      "content": "!"
                  },
                  {
                      "type": "delta_text",
                      "content": " "
                  },
                  {
                      "type": "delta_text",
                      "content": "😊"
                  }
              ]
          }
      ]
  },
]