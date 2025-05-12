/**
 * The context provided to
 * components of `TableSchemaView`
 */
export type TableSchemaViewContext<T extends unknown> = {
  /**
   * item
   */
  item: T;
  deleteDocument: (id: string) => Promise<void>;
  editDocumentUrl: (id: string) => string;
  viewDocumentUrl: (id: string) => string;
  linkExternalUrl: (id: string) => string;
};

/**
 * infer `params` of `react` functional component
 */
export type Params<T> = T extends React.FC<infer P> ? P : never;

/**
 * The `field` parameter given to `TableSchemaView`
 * components
 */
export type TableSchemaViewField<
  T extends any=any, 
  Key extends Exclude<keyof T, symbol | number> = Exclude<keyof T, number | symbol>, 
  Comp extends React.FC = React.FC
  > = {
  /**
   * Key of field in the data
   */
  key: Key;
  /**
   * Name of field
   */
  name: string;
  /**
   * Name of field
   */
  comp: Comp;
  /**
   * component parameters
   */
  comp_params?: React.ComponentProps<Comp>;
  /**
   * transform data
   */
  transform?: Key extends undefined ? (x: T) => any : (x: T[Key]) => T[Key];
};

/**
 * The `params` of components of
 * `TableSchemaView`
 */
export type TableSchemaViewComponentParams<
  V extends unknown, T extends unknown = any
  > = {
  /**
   * Key of field in the data
   */
  field?: TableSchemaViewField<T>;
  /**
   * Context
   */
  context?: TableSchemaViewContext<T>;
  /**
   * Value of field
   */
  value?: V;
};

const getValue = (key?: string, item: object={}, transform:(Function) = x => x) => {
  if(key===undefined)
    return transform(item);

  const parts = key ? key.split('.') : [];

  return transform(
    parts.reduce((p, c) => p?.[c], item)
  );
}

type RecordParams = {
  item: object;
  className?: string;
}

const Table = <T,>(
  { 
    context, fields, data, recordClassName, className, ...rest 
  }: TableSchemaViewProps<T>
) => {


  const Record = ({ item, className, ...rest }: RecordParams) => {
    
    return (
      <tr className={recordClassName} {...rest}>
        {
          fields.map(
            (field, ix) => {
              const is_last = ix==fields.length-1;
              const is_last_2 = ix==fields.length-2;
              let cls = 'w-32';
              if(is_last) {
                cls = '';
              }
              return (
                <td 
                  className={
                    ' font-light font-mono text-ellipsis overflow-clip hover:overflow-x-scroll ' +
                    (
                      ix==0 ? 'px-3 text-left ' : 
                      ix<fields.length-1 ? 
                      'px-3 text-center' : 
                      'px-0 text-right right-0  \
                      sticky z-10 --w-0 --shelf-body-bg opacity-80 h-14 \
                      flex flex-row justify-end items-center'
                    )
                  } 
                  key={ix} 
                  children={
                    (
                      <div className={'--overflow-x-scroll ' + (cls)}>
                        <field.comp 
                          context={{ item, ...context}} 
                          field={field} 
                          value={getValue(field.key, item, field.transform)}
                          {...field.comp_params} 
                        />
                      </div>
                    )
                  }
                /> 
              )
            }
          )
        }
      </tr>
    )
  }
  
  return (
<table className={className + ' --table-fixed table-auto'}>
  <thead>
    <tr className='border-b border-b-gray-300 
      dark:border-gray-300/25 h-10 text-xs font-inter 
      text-gray-400' >
    {
      fields.map(
        (field, ix) => {
          const is_last = ix==fields.length-1;
          const is_last_2 = ix==fields.length-2;
          let cls = 'w-32';
          if(is_last) {
            cls = '';
          }
          return (
            <th 
              className={
                'text-ellipsis ' +
                (
                  ix==0 ? 'text-left --px-3' : 
                  ix<fields.length-1 ? 
                  'text-center px-3' : 
                  'text-right px-0 sticky right-0  '
                )
              }
              
              key={ix} 
              children={
                (
                  <div className={'px-3 text-ellipsis ' + (cls)}>
                    {field.name}
                  </div>
                )
              } 
            /> 
          )
        }
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

export type TableSchemaViewProps<T> = {
  context: any;
  fields: TableSchemaViewField<any>[];
  data: object[];
  recordClassName?: string;
  className?: string;
}

export const TableSchemaView = <T,>(
  { 
    context, fields, data, 
    recordClassName=`bg-white dark:bg-white/5 
      dark:border-gray-300/25 border-b h-14`, 
    className=' ' ,  
  }: TableSchemaViewProps<T>
)  => {

  return (
<div className={`w-full ${className}`}>
  <div className='w-full overflow-auto'>
    <Table 
        context={context} 
        fields={fields} 
        data={data} 
        recordClassName={recordClassName}
        className='w-full bg-re-400 whitespace-nowrap'/>
  </div>
</div>
  )
}
