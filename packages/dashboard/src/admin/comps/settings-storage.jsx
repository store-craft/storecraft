import { useCallback, useMemo } from 'react'
import { SiCloudflare } from 'react-icons/si'
import { IoLogoFirebase } from 'react-icons/io5'
import { FaAws } from 'react-icons/fa'
import { BlingInput, HR } from './common-ui'
import {
  CloudflareR2Settings, S3CompatibleStorageSettings, 
  StorageSettings, StorageTypeEnum 
} from '../../admin-sdk/js-docs-types'

/**
 * @typedef {object} StorageProvider
 * @property {string} key
 * @property {string} name
 * @property {any} select_comp
 * @property {any} config_comp
 */

/**
 * @param {object} param0 
 * @param {(params: FirebaseStorageSettings) => any} param0.onChange
 * @param {FirebaseStorageSettings} param0.params
 */
const FirebaseStorage = ({ onChange, params }) => {

  const onInternalChange = useCallback(
    (key, value) => {
     
      onChange && onChange(
        { 
          ...params,
          [key]: value,  
        }
      )
    }, [onChange, params]
  )

  return (

<div className='flex flex-col gap-3'>
  <div>
    Please Make sure to enable &nbsp;
    <a href='docs/setup-firebase/storage' 
      className='border-b border-dashed 
                border-gray-700 dark:border-gray-400'
      children='Firebase Storage' />
  <HR dashed={true} className='my-5' />
  </div>    
  {
    [
      {
        key: 'custom_domain',
        name: 'Custom Domain (to rewrite uploads URLS for a CDN or custom domain)',
        placeHolder: 'https://<custom-domain>'
      }

    ].map(
      (it, ix) => (
        <div className='flex flex-col gap-1' key={ix}>
          <p children={it.name} />
          <BlingInput placeHolder={it.placeHolder ?? it.name} stroke='pb-px' 
                      value={it.value ?? params?.[it.key] ?? ''}
                      inputClsName='h-8 w-full' 
                      className='w-full' 
                      onChange={e => onInternalChange(it.key, e.currentTarget.value)} />
        </div>
      )
    )
  }
</div>    
  )  
}

/**
 * @param {object} param0 
 * @param {(params: S3CompatibleStorageSettings) => any} param0.onChange
 * @param {S3CompatibleStorageSettings} param0.params
 */
const CloudflareStorage = ({ onChange, params }) => {
  
  const onInternalChange = useCallback(
    (key, value) => {
      if(key === 'account_id') {
        value = `https://${value}.r2.cloudflarestorage.com`
        key = 'endpoint'
      }
      onChange && onChange(
        { 
          ...params, region: 'auto', force_path_style: true,
          [key]: value,  
        }
      )
    }, [onChange, params]
  )

  return (

<div className='flex flex-col gap-3'>
{
  [
    {
      key: 'account_id',
      name: 'Account ID',
      value: params?.endpoint ? new URL(params?.endpoint)?.hostname?.split('.')?.[0] : ''
    }, 
    {
      key: 'bucket', 
      name: 'Bucket Name'
    },
    {
      key: 'access_key',
      name: 'Access Key'
    },
    {
      key: 'secret',
      name: 'Secret'
    },
    {
      key: 'custom_domain',
      name: 'Custom Domain',
      placeHolder: 'https://<custom-domain>'
    }

  ].map(
    (it, ix) => (
      <div className='flex flex-col gap-1' key={ix}>
        <p children={it.name} />
        <BlingInput placeHolder={it.placeHolder ?? it.name} stroke='pb-px' 
                    value={it.value ?? params?.[it.key] ?? ''}
                    inputClsName='h-8 w-full' 
                    className='w-full' 
                    onChange={e => onInternalChange(it.key, e.currentTarget.value)} />
      </div>
    )
  )
}
</div>    
  )
}

/**
 * @param {object} param0 
 * @param {(params: S3CompatibleStorageSettings) => any} param0.onChange
 * @param {S3CompatibleStorageSettings} param0.params
 */
const AWSS3Storage = ({ onChange, params }) => {
  
  const onInternalChange = useCallback(
    (key, value) => {
      if(key === 'region') {
        value = `https://s3.${value}.amazonaws.com`
        key = 'endpoint'
      }
      onChange && onChange(
        { 
          ...params, force_path_style: false,
          [key]: value,  
        }
      )
    }, [onChange, params]
  )

  return (

<div className='flex flex-col gap-3'>
{
  [
    {
      key: 'region',
      name: 'Region',
      value: params?.endpoint ? new URL(params?.endpoint)?.hostname?.split('.')?.[1] : ''
    }, 
    {
      key: 'bucket', 
      name: 'Bucket Name'
    },
    {
      key: 'access_key',
      name: 'Access Key'
    },
    {
      key: 'secret',
      name: 'Secret'
    },
    {
      key: 'custom_domain',
      name: 'Custom Domain',
      placeHolder: 'https://<custom-domain>'
    }

  ].map(
    (it, ix) => (
      <div className='flex flex-col gap-1' key={ix}>
        <p children={it.name} />
        <BlingInput placeHolder={it.placeHolder ?? it.name} stroke='pb-px' 
                    value={it.value ?? params?.[it.key] ?? ''}
                    inputClsName='h-8 w-full' 
                    className='w-full' 
                    onChange={e => onInternalChange(it.key, e.currentTarget.value)} />
      </div>
    )
  )
}
</div>    
  )
}

/**
 * @param {object} param0 
 * @param {(params: S3CompatibleStorageSettings) => any} param0.onChange
 * @param {S3CompatibleStorageSettings} param0.params
 */
const S3CompatibleStorage = ({ onChange, params }) => {
  
  const onInternalChange = useCallback(
    (key, value) => {
      
      onChange && onChange(
        { 
          ...params,
          [key]: value,  
        }
      )
    }, [onChange, params]
  )

  return (

<div className='flex flex-col gap-3'>
  {
    [
      {
        key: 'endpoint',
        name: 'Endpoint'
      }, 
      {
        key: 'bucket', 
        name: 'Bucket Name'
      },
      {
        key: 'access_key',
        name: 'Access Key'
      },
      {
        key: 'secret',
        name: 'Secret'
      },
      {
        key: 'custom_domain',
        name: 'Custom Domain',
        placeHolder: 'https://<custom-domain>'
      }

    ].map(
      (it, ix) => (
        <div className='flex flex-col gap-1' key={ix}>
          <p children={it.name} />
          <BlingInput placeHolder={it.placeHolder ?? it.name} stroke='pb-px' 
                      value={it.value ?? params?.[it.key] ?? ''}
                      inputClsName='h-8 w-full' 
                      className='w-full' 
                      onChange={e => onInternalChange(it.key, e.currentTarget.value)} />
        </div>
      )
    )
  }
  <div className='flex flex-row gap-3 items-center mt-5'>
    <input id='cb_' type='checkbox' 
            checked={params?.force_path_style ?? false}
            onChange={e => onInternalChange('force_path_style', !(params?.force_path_style ?? false))}
            className='w-4 h-4 accent-pink-500 border-0 rounded-md 
                      focus:ring-0' />
    <label htmlFor='cb_' children='Force Path Style' className='flex-shrink-0' />
    <span children='( Whether to force path style URLs for S3 objects (e.g., https://s3.amazonaws.com/<bucketName>/<key> instead of https://<bucketName>.s3.amazonaws.com/<key> )' 
          className=' text-sm' />
  </div>

</div>    
  )
}

/**
 * @enum {StorageProvider} 
 */
const ProvidersList = {
  [StorageTypeEnum.google_cloud_storage]: {
    key: StorageTypeEnum.google_cloud_storage,
    name: 'Firebase Storage',
    select_comp: (
      <span className='inline-flex flex-row gap-3 items-baseline'>
        <IoLogoFirebase className='text-yellow-500 dark:text-yellow-400 
                inline text-2xl translate-y-1' />
        <span children='Firebase Storage' />
      </span>
    ),
    config_comp: FirebaseStorage
  },
  [StorageTypeEnum.cloudflare_r2]: {
    key: StorageTypeEnum.cloudflare_r2,
    name: 'Cloudflare R2',
    select_comp: (
      <span className='inline-flex flex-row gap-3 items-baseline'>
        <SiCloudflare className='text-orange-500 dark:text-orange-400 
                  inline text-2xl translate-y-1.5' />
        <span children='Cloudflare R2' />
      </span>
    ),
    config_comp: CloudflareStorage
  },
  [StorageTypeEnum.aws_s3]: {
    key: StorageTypeEnum.aws_s3,
    name: 'Amazon AWS S3',
    select_comp: (
      <span className='inline-flex flex-row gap-3 items-baseline'>
        <FaAws className='text-black dark:text-white 
                  inline text-2xl translate-y-2' />
        <span children='Amazon AWS S3' />
      </span>
    ),
    config_comp: AWSS3Storage
  },
  [StorageTypeEnum.compatible_s3]: {
    key: StorageTypeEnum.compatible_s3,
    name: 'Compatible S3',
    select_comp: (
      <span className='inline-flex flex-row gap-3 items-baseline'>
        <FaAws className='text-black dark:text-white 
                  inline text-2xl translate-y-2' />
        <span children='Other Compatible S3 service' />
      </span>
    ),
    config_comp: S3CompatibleStorage
  },
}


/**
 * @param {object} param0 
 * @param {StorageProvider} param0.provider
 */
const Providers = ({ provider, onChange }) => {

  return (
<div className='flex flex-col gap-3'>
  <fieldset className='border shelf-border-color p-3'>
      <legend className='text-base' children='Select Provider' />

      <div className='flex flex-col gap-3'>
        {
          Object.values(ProvidersList).map(
            (it, ix) => (
              <div key={it.key}>
                <input type='radio' 
                       id={it.key} name={it.key} 
                       value={it.key}
                       checked={provider.key===it.key} 
                       onChange={e => onChange && onChange(e.currentTarget.value)} />
                <label htmlFor={it.key} className='pl-3' 
                       children={it.select_comp} />
              </div>
            )
          )
        }
      </div>
  </fieldset>
</div>    
  )
}

/**
 * 
 * @param {object} param0 
 * @param {StorageSettings} param0.value
 */
const StorageSettingsView = 
  ({ field, value, onChange, className, ...rest }) => {

  const provider = value?.selected ?? StorageTypeEnum.google_cloud_storage

  const onParamsChange = useCallback(
    (params) => {
      onChange && onChange({ 
        ...value, items: {
          ...value.items,
          [provider]: params 
        }
      })
    }, [provider, value, onChange]
  )

  const onProviderChange = useCallback(
    key => {
      onChange && onChange({ ...value, selected: key })
    }, [value, onChange]
  )

  const ConfigComp = useMemo(
    () => ProvidersList[provider].config_comp,
    [provider]
  )

  return (
<div className='flex flex-col gap-3'>
  <Providers provider={ProvidersList[provider]} 
             onChange={onProviderChange} />

  <p children='Config' className='font-bold' />
  <ConfigComp onChange={onParamsChange} 
              params={value?.items?.[provider] ?? {}} />
</div>
  )
}

export default StorageSettingsView