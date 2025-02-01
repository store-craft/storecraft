import 'dotenv/config';
import { OpenAI } from './index.js';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const tools = [
  {
    function: {
      name: 'login',
      description: 'Login a customer with a given email and password',
      parameters: {
        type: 'object',
        email: {
          type: 'string',
          description: 'login email',
        },
        password: {
          type: 'string',
          description: 'Login password'
        },
        required: ["email", "password"]
      }
    },
    type: 'function'
  },  {
    function: {
      name: 'search_products',
      description: 'Search products of the store for info like pricing, discounts and collections',
      parameters: {
        type: 'object',
        query: {
          type: 'string',
          description: 'search keywords, can also use boolean notation for inclusion and exlusion',
        },
        count: {
          type: 'number',
          description: 'How many items to return from the search'
        },
        required: ["count"]
      }
    },
    type: 'function'
  },
  {
    function: {
      name: 'send_message_to_customer',
      description: 'Ask the customer a single and concise followup question or a comment',
      parameters: {
        type: 'object',
        query: {
          message: 'string',
          description: 'The message or question for the customer',
        },
      }
    },
    type: 'function'
  }

]

const prompt = `
You run in a loop of Thought, Suggestions ,Action, PAUSE, Observation.
At the end of the loop you output an Answer
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the suitable actions available to you - then return 
PAUSE.
Observation will be the result of running those actions.

Your available actions are:

${
  JSON.stringify(tools, null, 2)
}

Example session:

Question: How much does a Lenovo Laptop costs?
Thought: I should look the Laptop price using get_average_price
                
Action: get_average_price: Lenovo
PAUSE

You will be called again with this:

Observation: A lenovo laptop average price is $400

You then output:

Answer: A lenovo laptop costs $400
`

const prompt2 = `
You are the best shopping assistant.
You run in a loop of Thought ,Tool, PAUSE, ToolResult.
At the end of the loop you output an Answer
Use <Thought> to describe your thoughts about the question you have been asked.
Use <Tool> to run one of the suitable actions available to you - then return 
PAUSE.
<ToolResult> will be the result of running those tools.

Your available tools are:

${
  JSON.stringify(tools, null, 2)
}

Example session:

How much does a Lenovo Laptop costs?
<Thought> I should look the Laptop price using get_average_price </Thought>
                
<Tool>
  {
    function: {
      name: "get_average_price"
      parameters: {
        q: "Lenovo"
      }
    },
  }
</Tool>
PAUSE

You will be called again with this:

<ToolResult>
{
  function: "get_average_price",
  result: 400
}
</ToolResult>

You then output:

<Answer> A lenovo laptop costs $400 </Answer>
`


test(
  'sanity', 
  async () => {
    const ai = new OpenAI({
      api_key: process.env.AI_API_KEY,
      endpoint: 'https://api.groq.com/openai/v1/chat/completions'
    })

    const output = await ai.complete(
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: 'system',
            content: prompt2
          },
          {
            role: 'user',
            content: 'i need to login and get the price of super mario'
          },
          // {
          //   "role": "assistant",
          //   "content": "<Thought> To assist the user, I first need to login the customer, but the user didn't provide the email and password. Then, I should look for the price of Super Mario Bros using the search_products tool. However, I realize that I should ask the user for their email and password first. </Thought>\n\n<Tool>\n  {\n    \"function\": {\n      \"name\": \"send_message_to_customer\",\n      \"parameters\": {\n        \"message\": \"Could you please provide your email and password to login?\"\n      }\n    }\n  }\n</Tool>\nPAUSE"
          // },
          {
            role: 'user',
            content: 't@t.com and password is abcd1234'
          },
          {
            role: 'assistant',
            content: "<ToolResult>{function: 'login', result: 'auth success'}</ToolResult>"
          },

          // {
          //   "role": "assistant",
          //   "content": " \n\n<Thought> The customer's login attempt was unsuccessful, I should inform them of the error and ask them to try again. After a successful login, I can use the search_products tool to find the price of Super Mario Bros. </Thought>\n\n<Tool>\n  {\n    \"function\": {\n      \"name\": \"ask_followup_questions\",\n      \"parameters\": {\n        \"question\": \"Sorry, it seems like your email and password are incorrect. Can you please try again?\"\n      }\n    }\n  }\n</Tool>\nPAUSE"
          // },
          // {
          //   role: 'user',
          //   content: 't2@t.com and password is abcd1234'
          // },
          // {
          //   "role": "assistant",
          //   "content": "<Thought> The customer has provided their email and password again, now I should use the login tool to login the customer, after that I can use the search_products tool to find the price of Super Mario Bros. </Thought>\n\n<Tool>\n  {\n    \"function\": {\n      \"name\": \"login\",\n      \"parameters\": {\n        \"email\": \"t2@t.com\",\n        \"password\": \"abcd1234\"\n      }\n    }\n  }\n</Tool>\nPAUSE"
          // },
          // {
          //   role: 'assistant',
          //   content: "<ToolResult>{function: 'login', result: 'success'}</ToolResult>"
          // },
          // {
          //   "role": "assistant",
          //   "content": " \n\n<Thought> The customer has logged in successfully, now I can use the search_products tool to find the price of Super Mario Bros. </Thought>\n\n<Tool>\n  {\n    \"function\": {\n      \"name\": \"search_products\",\n      \"parameters\": {\n        \"query\": \"Super Mario Bros\",\n        \"count\": 1\n      }\n    }\n  }\n</Tool>\nPAUSE"
          // },
          // {
          //   role: 'assistant',
          //   content: "<ToolResult>{function: 'search_products', result: [{id: 'pr_32j92j39239j2', handle: 'super-mario-bros', price: 40, collections: ['games', 'nintendo-games'], discounts: null}]}</ToolResult>"
          // }

          // {
          //   "role": "assistant",
          //   "content": "<Thought> To assist the user with logging in, I need to obtain their email and password, then use the login function to authenticate them. </Thought>\n\n<Tools>\n[\n  {\n    \"function\": {\n      \"name\": \"ask_followup_questions\",\n      \"parameters\": {\n        \"question\": \"Please provide your email and password to login\"\n      }\n    }\n  }\n]\n</Tools>\nPAUSE"
          // },
          // {
          //   role: 'user',
          //   content: 't@t.com and password is abcd1234'
          // },
          // {
          //   "role": "assistant",
          //   "content": "<Thought> I have the email and password, now I can use the login function to authenticate the user. </Thought>\n\n<Tools>\n[\n  {\n    \"function\": {\n      \"name\": \"login\",\n      \"parameters\": {\n        \"email\": \"t@t.com\",\n        \"password\": \"abcd1234\"\n      }\n    }\n  }\n]\n</Tools>\nPAUSE"
          // },
          // {
          //   role: 'assistant',
          //   content: "<ToolsResults>{function: 'login', result: 'auth/error'}</ToolsResults>"
          // }


          // {
          //   "role": "assistant",
          //   "content": "<Thought> To assist with the login process, I need to gather the customer's email and password, then I can proceed with the login action.</Thought>\n\n<Action>ask_followup_questions({question: \"What is your email and password?\"})</Action>\nPAUSE"
          // },
          // {
          //   role: 'user',
          //   content: '<Observation> my email is t@t.com </Observation>'
          // },
          // {
          //   "role": "assistant",
          //   "content": "<Thought> The customer has provided their email address, but I still need their password to complete the login process. I should ask for the password.</Thought>\n\n<Action>ask_followup_questions({question: \"What is your password?\"})</Action>\nPAUSE"
          // },
          // {
          //   role: 'user',
          //   content: '<Observation>abcd123 </Observation>'
          // }

          // {
          //   "role": "assistant",
          //   "content": "Thought: To provide the price of the game, I first need to know the name of the game the user is looking for. I should ask for the name of the game to proceed with the search.\n\nAction: ask_followup_questions({\"question\": \"What is the name of the game you are looking for?\"})\nPAUSE"
    
          // },
          // {
          //   role: 'assistant',
          //   content: "Observation: [{ name: 'super mario 1', year: 1992, price: 10}, { name: 'super mario 2', year: 1994, price: 12}, { name: 'super mario 3', year: 1999, price: 15}]"
          // }

          // {
          //   role: 'user',
          //   content: 'Hi, can you tell me the price of a game i am looking for ?',
          // },
          // {
          //   "role": "assistant",
          //   "content": "Thought: To provide the price of the game, I first need to know the name of the game the user is looking for. I should ask for the name of the game to proceed with the search.\n\nAction: ask_followup_questions({\"question\": \"What is the name of the game you are looking for?\"})\nPAUSE"
    
          // },
          // {
          //   role: 'assistant',
          //   content: "Observation: [{ name: 'super mario 1', year: 1992, price: 10}, { name: 'super mario 2', year: 1994, price: 12}, { name: 'super mario 3', year: 1999, price: 15}]"
          // }

          // {
          //   "role": "assistant",
          //   "content": "Thought: To provide the user with Super Mario game suggestions, I should search for products related to Super Mario and retrieve a list of games.\n\nAction: search_products({query: \"Super Mario\", count: 4})\nPAUSE."
          // },
          // // {
          // //   role: 'user',
          // //   content: 'Actually, show me 3',
          // // },
          // {
          //   role: 'assistant',
          //   content: "Observation: [{ name: 'super mario 1', year: 1992, price: 10}, { name: 'super mario 2', year: 1994, price: 12}, { name: 'super mario 3', year: 1999, price: 15}]",
          // },
          // {
          //   role: 'assistant',
          //   "content": " \n\nAnswer: We have the following Super Mario games available: Super Mario 1, Super Mario 2, and Super Mario 3, released in 1992, 1994, and 1999 respectively, priced at $10, $12, and $15."
          // },
          // // {
          // //   role: "assistant",
          // //   "content": "Thought: The customer has initiated a conversation, but hasn't asked a specific question yet, so I should ask for clarification on what they need help with.\n\nAction: ask_followup_questions: What brings you here today? Are you looking for something in particular?\nPAUSE."
          // // },
          // {
          //   role: 'user',
          //   content: 'yes'
          // }
        ],
        stream: false,
        tools,
        tool_choice: 'none'
      }
    );
    
    console.log(JSON.stringify(output, null, 2));
  }
);

test.run();