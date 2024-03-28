const Span = ({data, ...rest}) => {
  return (
    <span {...rest} children={data} />
  )
}

const fields_test = [
  { key: 'firstname', name: 'First Name', type:'text', comp: Span },
  { key: 'lastname', name: 'Last Name', type:'text', comp: Span },
  { key: 'email', name: 'Email', type:'text', comp: Span },
  { key: 'uid', name: 'UID', type:'text', comp: Span },
]

const data2 = [
  { firstname: 'Tomer', lastname: 'Shalev', email: 'tsdsd@t.com' },
  { firstname: 'Daniel', lastname: 'Vaknin', email: 't@t.com' },
  { firstname: 'Rinat', lastname: 'Vaknin Shalev', email: 't@t.com' },
  { firstname: 'Dalhya', lastname: 'Shalev', email: 't@t.com' },
]

/**
 * 
 * @typedef {object} CollectionViewField
 * @property {string} key Key of field in the data
 * @property {string} name Name of field
 * @property {React.FC<any>} comp Name of field
 * @property {object} comp_params component parameters
 * @property {(x: any) => any} transform transform data
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
 * 
 * @param {object} p
 * @param {any} p.context anything to pass to component
 * @param {CollectionViewField[]} p.fields the fields schema
 * @param {any[]} p.data the data
 * @param {string} p.recordClassName
 */
const Table = 
  ({ context, fields, data, recordClassName, className, ...rest }) => {

  const Record = ({ item, className, ...rest }) => {
    return (
      <tr className={recordClassName}>
        {
          fields.map(
            (field, ix) => (
              <td 
                className={
                  ix==0 ? 'text-start pl-3' : 
                          ix<fields.length-1 ? 
                          'text-center pl-3' : 
                          'text-end pr-3'
                } 
                style={{width:'0.0%'}}
                key={ix} 
                children={
                  <field.comp context={{ item, ...context}} 
                              field={field} 
                              value={getValue(field.key, item[1], field.transform)}
                              {...field.comp_params} />
                          } /> 
            )
          )
        }
      </tr>
    )
  }
  
  return (
<table className={className}>
  <thead>
    <tr className='border-b border-b-gray-300 dark:border-gray-300/25 h-10  text-xs 
                   font-medium text-gray-400' >
    {
      fields.map(
        (field, ix) => 
          <th className={
            ix==0 ? 'text-left pl-3' : 
                    ix<fields.length-1 ? 
                    'text-center' : 'text-end pr-3'
                        }
              key={ix} 
              children={field.name} /> 
      )
    }
    </tr>
  </thead>
  <tbody>
  {
    data.map((item, ix) => <Record key={ix} item={item} />)
  }
  </tbody>
</table>
  )
}

/**
 * @param {object} p
 * @param {any} p.context anything
 * @param {CollectionViewField[]} p.fields scehma
 * @param {object[]} p.data actual data
 * @param {string} p.recordClassName
 */
export default ({ context, fields, data, 
                  recordClassName=`bg-white dark:bg-white/5 
                                   dark:border-gray-300/25 border-b 
                                   --border-gray-300 h-14`, 
                  className=' ' }) => {

  return (
<div className={`w-full --border-x ${className}`}>
  <div className='w-full overflow-auto'>
    <Table context={context} fields={fields} 
           data={data} recordClassName={recordClassName}
           className='w-full '/>
  </div>
</div>
  )
}
