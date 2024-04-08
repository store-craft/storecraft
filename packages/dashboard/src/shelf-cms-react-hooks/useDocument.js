import { useCallback, useEffect, useRef, useState } from "react"
import useTrigger from "./common/useTrigger.js"
import { getSDK } from '@/admin-sdk/index.js'

 
/**
 * @template {import("@storecraft/core/v-api").BaseType} T the document type
 * 
 * @param {string} resource the table `identifier`
 * @param {string} document the document `id` or `handle`
 * @param {boolean} autoLoad 
 * @param {boolean} try_cache_on_autoload 
 * @param {boolean} stale 
 * 
 * @returns 
 */
export function useCommonApiDocument(
  resource=undefined, document=undefined, autoLoad=true, 
  try_cache_on_autoload=true, stale=false
) {

  const [location, setLocation] = useState([resource, document])
  const [loading, setLoading] = useState(
    (resource && document && autoLoad) ? true : false
  );
  const [data, setData] = useState({})
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState(undefined)
  const [op, setOp] = useState(undefined)
  const trigger = useTrigger()

  useEffect(
    () => getSDK().auth.add_sub(trigger)
    ,[trigger]
  )

  const reload = useCallback(
    async (try_cache=true) => {
      if(!(location[0] && location[1]))
        throw 'no doc id'

      setLoading(true)
      setError(undefined)
      setOp('load')

      try {
        const data = await getSDK()[resource].get(
          location[1], try_cache
          );
        setData(data)
        setHasLoaded(true)
        return data
      } catch (e) {
        console.log(e)
        setError(e)
        throw e
      } finally {
        setLoading(false)
      }

    }, [location]
  )

  const upsert = useCallback(
    /**
     * 
     * @param {T} new_data 
     * @param  {...any} extra 
     * @returns {Promise<T>}
     */
    async (new_data, ...extra) => {
      setLoading(true)
      setError(undefined)
      setOp('update')

      try {
        const id = await getSDK()[resource].upsert(
          new_data
          );
        
        const saved_data = await getSDK()[resource].get(
          id
          );
        setData(saved_data)  
        setHasLoaded(true)
        return saved_data;
      } catch(e) {
        setError(e)
        console.log(JSON.stringify(e, null, 2))
        throw e
      } finally {
        setLoading(false)
      }
    }, [location]
  )

  // const create = useCallback(
  //   async new_data => {
  //     setLoading(true)
  //     setError(undefined)
  //     setOp('create')
  //     const collId = location[0]
      
  //     try {
  //       const [id, saved_data] = await getSDK()[resource].create(new_data)
  //       setLocation([collId, id])
  //       setData(saved_data)
  //       setHasLoaded(true)
  //       return [id, saved_data]
  //     } catch(e) {
  //       console.log('e ', e);
  //       setError(e)
  //       throw e
  //     } finally {
  //       setLoading(false)
  //     }
  //   }, [location]
  // )

  const deleteDocument = useCallback(
    async () => {
      setLoading(true)
      setError(undefined)
      setOp('delete')

      try {
        await getSDK()[resource].delete(location[1]);
        setData({})
        setHasLoaded(true)
        return location[1]
      } catch (e) {
        setError(e)
        throw e
      } finally {
        setLoading(false)
      }      
    }, [location]
  );

  useEffect(
    () => {
      if(resource==undefined)
        throw new Error('useDocument: no Collection Id')
        
      setLocation([resource, document])
      setData({})
    }, [resource, document]
  )

  useEffect(
    () => {
      if (autoLoad) reload(try_cache_on_autoload)
    }, [autoLoad, reload, location]
  )

  return {
    doc: stale || (document===location[1] && resource===location[0]) ? data : {} , 
    loading, hasLoaded, error, op, 
    actions: { 
      reload, upsert, deleteDocument, setError,
      colId: resource, docId : location[1] 
    }
  }
}

