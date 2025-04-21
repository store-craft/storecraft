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
                      <field.comp 
                        context={{ item, ...context}} 
                        field={field} 
                        value={getValue(field.key, item, field.transform)}
                        {...field.comp_params} 
                      />
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
        (field, ix) => (
          <th 
            className={
              ix==0 ? 'text-left pl-3' : 
              ix<fields.length-1 ? 
              'text-center' : 
              'text-end pr-3 sticky right-0 bg-white/60 dark:bg-transparent \
              --border-l-2 --shelf-body-bg '
            }
            key={ix} 
            children={field.name} 
          /> 
        )
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
        className='w-full table-fixed2 whitespace-nowrap'/>
  </div>
</div>
  )
}
