/**
 * @import { Choice } from '../../utils.js';
 */
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text, 
} from '@clack/prompts';
import { required, withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'OpenAI',
    value: 'openai'
  },
  {
    name: 'Anthropic',
    value: 'anthropic'
  },
  {
    name: 'Gemini',
    value: 'gemini'
  },
  {
    name: 'Groq Cloud',
    value: 'groq'
  },
  {
    name: 'Mistral',
    value: 'mistral'
  },
  {
    name: 'Gemini',
    value: 'gemini'
  },
  {
    name: 'xAI',
    value: 'xai'
  },
])

export const collect_ai_chat = async () => {

  const id = await withCancel(
    select(
      {
        message: '🤖 Select AI Chat Provider',
        options: choices.map(
          c => (
            {
              value: c.value,
              label: c.name, 
            }
          )
        ),
      }
    )
  );

  return {
    type: 'ai-chat',
    id: id,
    config: await collect_general_config(id)
  };
}

/**
 * 
 * @param {choices[number]["value"]} id 
 * @returns 
 */
const collect_general_config = async (
  id
) => {
  switch(id) {
    case 'anthropic': {
      /** @type {import('@storecraft/core/ai/models/chat/anthropic').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Claude API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Claude Model will you use ?',
              options: [
                { value: 'claude-3-5-haiku-20241022'},
                { value: 'claude-3-5-sonnet-20241022'},
                { value: 'claude-3-haiku-20240307'},
                { value: 'claude-3-opus-20240229'},
              ]
            }
          )
        ),
      }

      return config;
    }

    case 'gemini': {
      /** @type {import('@storecraft/core/ai/models/chat/gemini').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Gemini API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Gemini Model will you use ?',
              options: [
                { value: 'gemini-1.5-flash'},
                { value: 'gemini-1.5-flash-8b'},
                { value: 'gemini-1.5-pro'},
                { value: 'gemini-2.0-flash'},
                { value: 'gemini-2.0-flash-lite-preview-02-05'},
              ]
            }
          )
        ),
      }

      return config;
    }

    case 'groq': {
      /** @type {import('@storecraft/core/ai/models/chat/groq').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Groq Cloud API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Groq Cloud Model will you use ?',
              options: [
                { value: 'llama-3.3-70b-versatile'},
                { value: 'deepseek-r1-distill-llama-70b'},
                { value: 'gemma2-9b-it'},
                { value: 'llama-3.1-8b-instant'},
                { value: 'llama-3.2-3b-preview'},
                { value: 'llama3-8b-8192'},
              ]
            }
          )
        ),
      }

      return config;
    }

    case 'mistral': {
      /** @type {import('@storecraft/core/ai/models/chat/mistral').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'Mistral API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which Mistral Model will you use ?',
              options: [
                { value: 'mistral-large-latest'},
                { value: 'codestral-latest'},
                { value: 'ministral-3b-latest'},
                { value: 'ministral-8b-latest'},
                { value: 'mistral-saba-latest'},
                { value: 'mistral-small-latest'},
                { value: 'open-mistral-nemo'},
                { value: 'pixtral-12b-2409'},
                { value: 'pixtral-large-latest'},
              ]
            }
          )
        ),
      }      
      return config;
    }

    case 'openai': {
      /** @type {import('@storecraft/core/ai/models/chat/openai').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'OpenAI API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which OpenAI Model will you use ?',
              options: [
                { value: 'gpt-4'},
                { value: 'gpt-4-turbo'},
                { value: 'gpt-4o'},
                { value: 'gpt-4o-mini'},
                { value: 'o1-mini'},
              ]
            }
          )
        ),
      }      
      return config;
    }
    
    case 'xai': {
      /** @type {import('@storecraft/core/ai/models/chat/xai').config} */
      const config = {
        api_key: await withCancel(
          text(
            { 
              message: 'xAI API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        model: await withCancel(
          select(
            { 
              message: 'Which xAI Model will you use ?',
              options: [
                { value: 'grok-2'},
                { value: 'grok-2-vision'},
                { value: 'grok-3'},
              ]
            }
          )
        ),
      }      
      return config;
    }
      
  }

}