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