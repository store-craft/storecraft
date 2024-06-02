import { useCallback, useMemo, useRef } from 'react';
import { decode } from '../utils/index.js';
import useNavigateWithState from './useNavigateWithState.jsx';
import { useDocument } from '@storecraft/sdk-react-hooks';
import { App } from '@storecraft/core';

/**
 * @template T the `document` type
 * 
 * @typedef {Omit<ReturnType<typeof useDocumentActions<T>>, 'doc'> & 
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
 * to `useDocument`, it adds:
 * - Aggregating from a functional component
 * - Paginating by url navigation, for state saving.
 * - Context
 * 
 * 
 * @template {{}} T The type of `document`
 * 
 * 
 * @param {(keyof App["db"]["resources"] | 'payments/gateways' | 'extensions')} resource 
 * resource `identifier`
 * @param {string} document document `handle` or `id`
 * @param {string} slug resource `slug` at backend
 * @param {DocumentActionsMode} mode 
 * @param {string} [base] base64 encoded base `document` to merge with
 * 
 */
export const useDocumentActions = (resource, document, slug, mode='edit', base) => {
  /** 
   * @type {React.MutableRefObject<
   *  import('@/comps/fields-view.jsx').FieldViewImperativeInterface<
   *    T
   *  >
   * >
   * } 
   */
  const ref_root = useRef();

  /**
   * @type {import('@storecraft/sdk-react-hooks').useDocumentHookReturnType<T>}
   */
  const { 
    doc: doc_original, loading, hasLoaded, error, op, sdk,
    actions: { 
      reload, upsert, setError, remove,
    }
  } = useDocument(resource, document);

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
      const doc = { 
        ...base_o, 
        ...doc_original, 
        ...(state?.hasChanged ? state?.data : {})
      }
      return doc
    }, [doc_original, base, state]
  );

  // console.log('doc', doc)

  /** 
   * @type {React.MutableRefObject<
   *   import('@/comps/common-ui.jsx').CreateDateImperativeInterface>
   * } 
   */
  const ref_head = useRef();
  const hasChanged = state?.hasChanged ?? false;
  const isEditMode = mode==='edit';
  const isCreateMode = mode==='create';
  const isViewMode = !(isEditMode || isCreateMode);
    
  /** 
   * @type {import('../pages/index.jsx').BaseDocumentContext<{
   *    hasChanged?: boolean,
   *    data?: T
   *  }>
   * } 
   */
  const context = useMemo(
    () => (
      {
        getState: () => {
          const data = ref_root.current.get(false)?.data
          const hasChanged = Boolean(ref_head.current.get())
          return {
            data, hasChanged
          }
        },
      }
    ), []
  );

  
  const duplicate = useCallback(
    /**
     * 
     * @param {Partial<T>} state_next_extra 
     */
    async (state_next_extra={}) => {

      const state = context.getState();

      /**@type {import('../pages/index.jsx').BaseDocumentState<T>} */
      const state_next = { 
        data: { 
          ...state?.data,
          handle: undefined,
          id: undefined,
          updated_at: undefined,
          created_at: undefined,
          search: undefined,
          _published: undefined,
          ...state_next_extra
        },
        hasChanged: true
      }

      ref_head.current.set(false)

      if(slug) {
        navWithState(
          `${slug}/create`, state, state_next
        );
      }

    }, [navWithState, context, slug]
  );

  const savePromise = useCallback(
    async () => {
      // const doc = await reload()
      const all = ref_root.current.get();

      const { validation : { has_errors, fine }, data } = all;

      const final = { ...doc, ...data };
      console.log('final ', final);

      const new_doc = await upsert(final);
      console.log('new doc', new_doc);

      if(slug) {
        nav(
          `${slug}/${new_doc.handle ?? new_doc.id}`, 
          { replace: true }
        );
      } 

      return new_doc;

    }, [upsert, nav, doc, slug]
  );

  const reloadPromise = useCallback(
    async (try_cache=false) => {

      if(slug) {
        nav(
          `${slug}/${doc.handle ?? doc.id}`, 
          { replace: true }
        );
      } 
      await reload(try_cache);

    }, [reload, nav, doc, slug]
  );

  const deletePromise = useCallback(
    async () => {
      const id_or_handle = await remove();

      if(slug) nav(-2);

      return id_or_handle;

    }, [remove, nav, slug]
  );

  // A suggestion for a unique key
  const key = useMemo(
    () => JSON.stringify(doc),
    [doc]
  );


  return {
    actions: {
      reloadPromise, savePromise, deletePromise, duplicate, 
      navWithState, reload, setError
    },
    error, key, ref_head, ref_root, doc, sdk,
    isEditMode, isCreateMode, isViewMode,
    loading, hasChanged, hasLoaded, context
  }
}
