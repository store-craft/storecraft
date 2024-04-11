import { useCallback, useMemo, useRef } from 'react';
import { decode } from '../utils/index.js';
import useNavigateWithState from './useNavigateWithState.js';
import { useCommonApiDocument } from '@/admin-sdk-react-hooks/useDocument.js';
import {useNavigate} from 'react-router-dom'

/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<useDocumentActions<T>>, 'doc'> & 
 *  {
 *    doc: T  
 *  }
 * } HookReturnType This `type` will give you the return type of the hook
 * 
 */

/**
 * @typedef {'edit' | 'view' | 'create'} DocumentActionsMode
 */

/**
 * Your definitive hook for `document` adventures with UI. Compared
 * to `useCommonApiDocument`, it adds:
 * - Aggregating from a functional component
 * - Paginating by url navigation, for state saving.
 * - Context
 * 
 * @template {{}} [T={}] The type of `document`
 * 
 * @param {string} resource resource `identifier`
 * @param {string} document document `handle` or `id`
 * @param {string} slug resource `slug` at backend
 * @param {DocumentActionsMode} mode 
 * @param {string} [base] base64 encoded base `document` to merge with
 * 
 */
export const useDocumentActions = (resource, document, slug, mode, base) => {
  /** 
   * @type {React.MutableRefObject<
   *  import('@/admin/comps/fields-view.jsx').FieldViewImperativeInterface<
   *    import('@storecraft/core/v-api').ProductType>>
   * } 
   */
  const ref_root = useRef();
  const { 
    doc: doc_original, loading, hasLoaded, error, op,
    actions: { 
      reload, upsert, setError, create, deleteDocument, colId, docId 
    }
  } = useCommonApiDocument(resource, document);

  const { 
    nav, navWithState, state 
  } = useNavigateWithState();

  /**
   * @type {T} 
   */
  const doc = useMemo(
    () => {
      let base_o = {}
      try {
        base_o = base ? decode(base) : {}
      } catch (e) {}
      const doc = { ...base_o, ...doc_original, ...state?.data }
      return doc
    }, [doc_original, base, state]
  );

  // console.log('doc', doc)

  /** 
   * @type {React.MutableRefObject<
   *   import('@/admin/comps/common-ui.jsx').CreateDateImperativeInterface>
   * } 
   */
  const ref_head = useRef();
  const hasChanged = state?.hasChanged ?? false
  const isEditMode = mode==='edit'
  const isCreateMode = mode==='create'
  const isViewMode = !(isEditMode || isCreateMode)
    
  /** @type {import('../pages/index.jsx').BaseDocumentContext<State>} */
  const context = useMemo(
    () => ({
      /** @returns {State} */
      getState: () => {
        const data = ref_root.current.get(false)?.data
        const hasChanged = Boolean(ref_head.current.get())
        return {
          data, hasChanged
        }
      },
    }), []
  );

  const duplicate = useCallback(
    async () => {
      const state = context.getState()
      /**@type {State} */
      const state_next = { 
        data: { 
          ...state?.data,
          handle: undefined,
          id: undefined,
          updated_at: undefined,
          created_at: undefined,
          search: undefined,
          _published: undefined,
        },
        hasChanged: false
      }
      ref_head.current.set(false)
      navWithState(`${slug}/create`, 
            state, state_next
      );
    }, [navWithState, context, slug]
  );

  const savePromise = useCallback(
    async () => {
      // const doc = await reload()
      const all = ref_root.current.get()
      const { validation : { has_errors, fine }, data } = all
      const final = { ...doc, ...data}
      console.log('final ', final);
      const new_doc = await upsert(final);
      console.log('new doc', new_doc)
      nav(`${slug}/${new_doc.handle ?? new_doc.id}/edit`, { replace: true })
    }, [upsert, nav, doc, reload, slug]
  );

  const deletePromise = useCallback(
    async () => {
      await deleteDocument();
      // nav(`${slug}`, { replace: true })
      // history.back();
      // console.log(window.history)
      nav(-2);
    }, [deleteDocument, nav]
  );

  // A suggestion for a unique key
  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  );


  return {
    actions: {
      savePromise, deletePromise, duplicate, navWithState, 
      reload, setError
    },
    error, key, 
    ref_head, ref_root, doc, isEditMode, isCreateMode,
    isViewMode,
    loading, hasChanged, hasLoaded, context
  }
}
