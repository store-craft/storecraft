import { useCallback, useEffect, useRef, useState } from "react"
import useTrigger from "./common/useTrigger.js"
import { getSDK } from '@/admin-sdk/index.js'

 
/**
 * 
 * @param {string} colId 
 * @param {string} docId 
 * @param {boolean} autoLoad 
 * @param {boolean} try_cache_on_autoload 
 * @param {boolean} stale 
 * @returns 
 */
export function useCommonApiDocument(
  colId=undefined, docId=undefined, autoLoad=true, try_cache_on_autoload=true, stale=false) {

  const [location, setLocation] = useState([colId, docId])
  const [loading, setLoading] = useState((colId && docId && autoLoad) ? true : false)
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
        const [exists, id, data] = await getSDK()[colId].get(
          location[1], try_cache
          )
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

  const set = useCallback(
    async (new_data, ...extra) => {
      setLoading(true)
      setError(undefined)
      setOp('update')

      try {
        const [id, saved_data] = await getSDK()[colId].set(
          location[1], new_data, ...extra
          )
        setData(saved_data)  
        setHasLoaded(true)
        return [id, saved_data]
      } catch(e) {
        setError(e)
        throw e
      } finally {
        setLoading(false)
      }
    }, [location]
  )

  const create = useCallback(
    async new_data => {
      setLoading(true)
      setError(undefined)
      setOp('create')
      const collId = location[0]
      
      try {
        const [id, saved_data] = await getSDK()[colId].create(new_data)
        setLocation([collId, id])
        setData(saved_data)
        setHasLoaded(true)
        return [id, saved_data]
      } catch(e) {
        console.log('e ', e);
        setError(e)
        throw e
      } finally {
        setLoading(false)
      }
    }, [location]
  )

  const deleteDocument = useCallback(
    async () => {
      setLoading(true)
      setError(undefined)
      setOp('delete')

      try {
        await getSDK()[colId].delete(location[1]);
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
  )

  useEffect(
    () => {
      if(colId==undefined)
        throw new Error('useDocument: no Collection Id')
        
      setLocation([colId, docId])
      setData({})
    }, [colId, docId]
  )

  useEffect(
    () => {
      if (autoLoad) reload(try_cache_on_autoload)
    }, [autoLoad, reload, location]
  )

  return {
    doc: stale || (docId===location[1] && colId===location[0]) ? data : {} , 
    loading, hasLoaded, error, op, 
    actions: { 
      reload, set, create, deleteDocument, 
      colId, docId : location[1] 
    }
  }
}



// export function useDatabaseDocument(colId=undefined, docId=undefined, autoLoad=true) {
//   const [location, setLocation] = useState([colId, docId])
//   const [loading, setLoading] = useState((colId && docId && autoLoad) ? true : false)
//   const [data, setData] = useState({})
//   const [hasLoaded, setHasLoaded] = useState(false)
//   const [error, setError] = useState(undefined)
//   const [op, setOp] = useState(undefined)
//   const trigger = useTrigger()

//   useEffect(() => {
//     return getSDK().auth.add_sub(trigger)
//   }, [trigger])

//   const reload = useCallback(() => {
//     if(!(location[0] && location[1]))
//       return

//     setLoading(true)
//     setError(undefined)
//     setOp('load')

//     getSDK().db.doc(location[0], location[1]).get()
//       .then(([exists, id, data]) => data)
//       .then(res => { setData(res); setHasLoaded(true); setLoading(false) })
//       .catch(err => { setError(err); setLoading(false) })

//   },[location])

//   const update = useCallback(new_data => {
//     setLoading(true)
//     setError(undefined)
//     setOp('update')

//     getSDK().db.doc(location[0], location[1]).update(new_data)
//       .then(() => {
//         const prev_data = data || {}
//         new_data = {...prev_data, ...new_data}
//         setData(new_data)
//         setHasLoaded(true)
//         setLoading(false)
//       })
//       .catch(err => { setError(err); setLoading(false) })
//   }, [location])

//   const create = useCallback((new_data) => {
//     setLoading(true)
//     setError(undefined)
//     setOp('create')

//     const collId = location[0]
//     getSDK().db.col(collId).add(new_data)
//       .then(id => {
//         setLocation([collId, id])
//         setData({...new_data})
//         setHasLoaded(true)
//         setLoading(false)
//       })
//       .catch(err => { setError(err); setLoading(false) })
//   }, [location])

//   const createWithId = useCallback((id, new_data) => {
//     setLoading(true)
//     setError(undefined)
//     setOp('create')

//     const collId = location[0]
//     getSDK().db.doc(collId, id).set(new_data)
//       .then(() => {
//         setLocation([collId, id])
//         setData({...new_data})
//         setHasLoaded(true)
//         setLoading(false)
//       })
//       .catch(err => { setError(err); setLoading(false) })
//   }, [location])

//   const deleteDocument = useCallback(() => {
//     setLoading(true)
//     setError(undefined)
//     setOp('delete')

//     getSDK().db.col(location[0]).remove(location[1])
//       .then(() => {
//         setData({})
//         setHasLoaded(true)
//         setLoading(false)
//       })
//       .catch(err => { setError(err); setLoading(false) })
//   }, [location])

//   useEffect(() => {
//     if(colId==undefined)
//       throw new Error('useDocument: no Collection Id')

//     setLocation([colId, docId])
//     setData({})
//   }, [colId, docId])

//   useEffect(() => {
//     if (autoLoad) 
//       reload()
//   }, [autoLoad, reload])

//   return [data, loading, hasLoaded, error, op, 
//           { reload, update, create, createWithId, deleteDocument, 
//             colId : location[0], docId : location[1] }]
// }
