import { Card } from './common-ui.jsx'
import { useCallback, useState } from 'react'
import { getSDK } from '@storecraft/sdk'
import TagsEdit from './tags-edit.jsx'
import { PromisableLoadingBlingButton } from './common-button.jsx'
import { HR } from './common-ui.jsx'

const BulkTagProductsInCollection = ({ collectionId, value }) => {
  const [tags, setTags] = useState([])
  const [error, setError] = useState()

  collectionId = value?.handle ?? collectionId

  const onApply = useCallback(
    async (add=true) => {
      try {
        setError(undefined)
        await getSDK().collections.bulkAddRemoveTags(collectionId, tags, add)
      } catch (e) {
        console.error(e)
        setError(e?.message ?? String(e))
      }
    }, [tags, collectionId]
  )
  
  if(!collectionId)
    return null

  return (
<Card name='Add tags to all products in Collection' 
      className='w-full h-fit' 
      error={error} desc='Add/Remove all tags at once'>
  <TagsEdit className='w-full h-fit' onChange={setTags}  />
  <HR className='my-5'/>

  <div className='flex flex-row justify-between w-full --mt-5'>
    <PromisableLoadingBlingButton 
      text='Add Tags' keep_text_on_load={true} 
      className='w-fit'
      onClick={_ => onApply(true)}  />

    <PromisableLoadingBlingButton 
      text='Remove Tags' keep_text_on_load={true} 
      className='w-fit'
      onClick={_ => onApply(false)}  />

  </div>
  
</Card>
  )
}

export default BulkTagProductsInCollection
