
/**
 * @template {any | import("@storecraft/core/v-api").BaseType} T
 * 
 * @typedef {object} TableSchemaViewContext The context provided to 
 * components of `TableSchemaView`
 * @property {T} item item
 * @property {(id: string) => Promise<void>} deleteDocument
 * @property {(id: string) => string} editDocumentUrl
 * @property {(id: string) => string} viewDocumentUrl
 */


/**
 * infer `params` of `react` functional component
 * 
 * @template T
 * 
 * @typedef {T extends React.FC<infer P> ? P: never} Params
 */

/**
 * @template {any} T The item general type
 * @template {keyof T} [Key=keyof T]
 * @template {React.FC} [Comp=React.FC<TableSchemaViewComponentParams<T, Key>>]
 * 
 * @typedef {object} TableSchemaViewField The `field` parameter given to `TableSchemaView`
 * components
 * 
 * @property {Key} key Key of field in the data
 * @property {string} name Name of field
 * @property {React.FC<Params<Comp> & TableSchemaViewComponentParams<T[Key], T>>} comp Name of field
 * @property {Params<Comp>} [comp_params] component parameters
 * @property {Key extends undefined ? (x: T) => any : (x: T[Key]) => T[Key]} [transform] transform data
 */


/**
 * @template {any} V The field value type
 * @template {any} [T=any] The item general type
 * 
 * 
 * @typedef {object} TableSchemaViewComponentParams The `params` of components of
 * `TableSchemaView`
 * @property {TableSchemaViewField<T>} [field] Key of field in the data
 * @property {TableSchemaViewContext<T>} [context] Context
 * @property {V} [value] Value of field
 */

/**
 * @param {string} key
 * @param {any} item data record
 * @param {(x: any) => any} transform transform function
 */
const getValue = (key, item, transform = x => x) => {
  if(key===undefined)
    return transform(item)
  const parts = key ? key.split('.') : []
  return transform(parts.reduce((p, c) => p?.[c], item))
}

/**
 * @template T
 * 
 * @param {object} p
 * @param {any} p.context anything to pass to component
 * @param {TableSchemaViewField<T>[]} p.fields the fields schema
 * @param {import("@storecraft/core/v-api").BaseType[]} p.data the data
 * @param {string} p.recordClassName
 * @param {string} [p.className]
 */
const Table = (
  { 
    context, fields, data, recordClassName, className, ...rest 
  }
) => {


  /**
   * 
   * @param {object} param0 
   * @param {import("@storecraft/core/v-api").BaseType} param0.item 
   * @param {string} [param0.className] 
   */
  const Record = ({ item, className, ...rest }) => {
    
    return (
      <tr className={recordClassName} {...rest}>
        {
          fields.map(
            (field, ix) => (
              <td 
                className={
                  ix==0 ? 'text-start pl-3 overflow-x-scroll' : 
                          ix<fields.length-1 ? 
                          'text-center px-3 overflow-x-clip ' : 
                          'text-end pr-3 right-0 bg-white/60 dark:bg-transparent \
                          sticky z-10 w-0  --border-l-2 overflow-clip shelf-body-bg opacity-80'
                } 
                // width={'10px'}
                // style={{width:'0.0%'}}
                key={ix} 
                children={
                  (
                    <>
                  {/* <div className={ix==fields.length-1 ? 'w-full h-full backdrop-blur-sm absolute -z-30' : 'hidden'} />   */}
                  <field.comp 
                      context={{ item, ...context}} 
                      field={field} 
                      value={getValue(String(field.key), item, field.transform)}
                      {...field.comp_params} />
                    </>
                  )
                }/> 
            )
          )
        }
      </tr>
    )
  }
  
  return (
<table className={className}>
  <thead>
    <tr className='border-b border-b-gray-300 dark:border-gray-300/25 
                   h-10 text-xs font-medium text-gray-400' >
    {
      fields.map(
        (field, ix) => 
          <th className={
              ix==0 ? 'text-left pl-3' : 
                      ix<fields.length-1 ? 
                      'text-center' : 
                      'text-end pr-3 sticky right-0 bg-white/60 dark:bg-transparent \
                      --border-l-2 --shelf-body-bg '
                    }
              key={ix} 
              children={field.name} /> 
      )
    }
    </tr>
  </thead>
  <tbody>
  {
    data.map(
      (item, ix) => <Record key={ix} item={item} />
    )
  }
  </tbody>
</table>
  )
}

/**
 * @template T the original data type
 * 
 * @param {object} p
 * @param {any} p.context anything
 * @param {TableSchemaViewField<T>[]} p.fields scehma
 * @param {object[]} p.data actual data
 * @param {string} [p.recordClassName]
 * @param {string} [p.className]
 */
export const TableSchemaView = (
  { 
    context, fields, data, 
    recordClassName=`bg-white dark:bg-white/5 
                      dark:border-gray-300/25 border-b 
                      --border-gray-300 h-14`, 
    className=' ' 
  }
) => {

  return (
<div className={`w-full ${className}`}>
  <div className='w-full overflow-auto'>
    <Table 
        context={context} 
        fields={fields} 
        data={data} 
        recordClassName={recordClassName}
        className='w-full table-fixed2 whitespace-nowrap'/>
  </div>
</div>
  )
}
