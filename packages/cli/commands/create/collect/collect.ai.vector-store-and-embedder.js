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
import { collect_ai_embedder } from './collect.ai.embedder.js';
import { collect_ai_vector_store } from './collect.ai.vector-store.js';

export const collect_vector_store_and_embedder = async () => {

  const start = await withCancel(
    confirm(
      {
        message: 'Add Vector Store for similarity search and AI agents (Recommended) ?',
        active: 'Yes',
        inactive: 'No',
        initialValue: true
      }
    )
  );

  if(!start) {
    return {
      ai_vector_store: undefined,
      ai_embedder: undefined,
    }
  }  

  return {
    ai_vector_store: await collect_ai_vector_store(),
    ai_embedder: await collect_ai_embedder(),
  }
}
