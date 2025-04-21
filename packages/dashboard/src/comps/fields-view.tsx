import React, { 
  forwardRef, useCallback, 
  useImperativeHandle, useRef, useState 
} from 'react'
import { useMemo } from 'react'
import { useEffect } from 'react'

// End Test Data
export const EVENT_CHANGE = 'pubsub.on_change'
export const EVENT_REFRESH = 'pubsub.on_refresh'

type PubSubSubscriber = (event: string, value?: any) => void

class PubSub {
  _subscribers = new Set<PubSubSubscriber>()

  constructor() {

  }

  add_sub = (cb: PubSubSubscriber) => {
    this._subscribers.add(cb)
    // console.log(this._subscribers.size)

    return () => {
      this._subscribers.delete(cb)
    }
  }

  dispatch = (event, data=undefined) => {
    // console.log(event)
    this._subscribers.forEach(
      cb => cb(event, data)
    )
  }
}

export const pubsub = new PubSub()

const DefaultValidator = {
  text: (value) => {
    if (typeof value !== 'string')
      return [false, 'Value is not a string']
    if(!value && value.trim()==='')
      return [false, 'Empty value']
    return [true, 'All good']
  },
  number: (value) => {
    if (!isNaN(parseFloat(value)))
      return [true, 'parseFloat(value)!==NaN']
    return [false, 'Value is not a number']
  },
  email: (value) => {
    let re = /\S+@\S+\.\S+/;
    let v = re.test(value)
    let s = v ? 'Email ok' : 'Email is not valid format'
    return [v, s]
  },
  unknown : (type) => {
    return [true, `type ${type} is not known in Validator`]
  }
}

const getProp = (prop: string, from: object, default_value=undefined) => {
  return from.hasOwnProperty(prop) ? from[prop] : default_value
}

const isFieldEditable = (field: object) => getProp('editable', field, true)
const shouldValidateField = (field: object) => getProp('validate', field, true)


const validateField = (field: FieldData, value: any) => {
  const should = shouldValidateField(field)
  const validator = should ? 
    getProp('validator', field, DefaultValidator[field.type]) : 
    undefined
  return validator ? validator(value) : [true, undefined]
}

export type FieldData<PROPS extends any = any> = {
  type?: string;
  key?: string;
  validate?: boolean;
  editable?: boolean;
  running_key?: string;
  defaultValue?: any;
  name?: string;
  desc?: string;
  /**
   * nested fields
   */
  fields?: FieldData<any>[];
  /**
   * a react component
   */
  comp?: React.FC<PROPS>;
  comp2?: React.FC<
    PROPS & FieldLeafViewParams<any> & 
    Partial<React.ComponentProps<'div'>>
  >;
  /**
   * params for comp
   */
  comp_params?: PROPS;
};

export type FieldContextData<D extends unknown = {}> = {
  /**
   * running key for leafs
   */
  running_key?: string;
  pubsub?: PubSub;
  /**
   * the entire original data
   */
  data?: D;
  /**
   * the entire original data
   */
  query?: Record<string, {
      get: () => any;
      set?: (val: any) => void;
  }>;
};

/**
* Root view params
*/
export type FieldViewParams<
  O extends unknown = {}, C extends unknown = {}
  > = {
  /**
   * running key for leafs
   */
  running_key?: string;
  field: FieldData;
  value: O;
  className?: string;
  context?: C;
  isViewMode: boolean;
};

export type FieldNodeViewParams<
  V extends unknown = any, 
  C extends {} = {}, 
  O extends unknown = {}
  > = {
  /**
   * running key for leafs
   */
  running_key?: string;
  field: FieldData;
  value: V;
  className?: string;
  context?: FieldContextData<O> & C;
  isViewMode: boolean;
};

/**
* Every view in the `fields-view` schema will be injected with
* the following parameters
*/
export type FieldLeafViewParams<V, C = {}, O = {}> = {
  field?: FieldData;
  value?: V;
  context?: FieldContextData<O> & C;
  disabled?: boolean;
  onChange?: (value: V) => void;
  setError?: (error: string) => void;
  error?: string;
};
export type FieldViewImperativeInterface<T> = {
  /**
   * Drill and get all nodes rendered data
   */
  get: (validate?: boolean) => {
    data: T;
    validation: {
      fine: Record<string, [valid: boolean, message: string, fieldname: string]>;
      has_errors: boolean;
    };
  };
};

/**
 * 
 * @param {string} running_key 
 * @param {string} field_key 
 */
const compute_running_key = (running_key, field_key) => {
  let running_key_2 = (running_key ?? '')
  if(field_key) {
    if(running_key)
      running_key_2 += '.'
    running_key_2 += field_key
  }
  return running_key_2
}

const FieldViewInternal = forwardRef(
  <V, C, O,>(
    { 
      field, value, context, running_key, isViewMode, ...rest
    }: FieldNodeViewParams<V, C, O>, ref
  ): React.ReactElement<FieldLeafViewParams<V, C, O>> => {

  running_key = compute_running_key(running_key, field.key)
  // console.log('running_key ', running_key)
  const [validationError, setValidationError] = useState(undefined)
  const [v, setV] = useState(value ?? field.defaultValue)

  const isFieldEditablePlus = useCallback(
    () => isFieldEditable(field) && !isViewMode, 
    [field, isViewMode]
  );

  const onChange_internal = useCallback(
    (val: V) => {
      if(isFieldEditablePlus()) {
        // console.log(running_key, val)
        setV(val)
        pubsub.dispatch(EVENT_CHANGE)
        pubsub.dispatch(running_key, val)
      }
    }, 
    [isFieldEditablePlus, pubsub, running_key]
  );

  useEffect(
    () => {
      pubsub.dispatch(running_key, v)
    }, 
    [pubsub, running_key, v]
  );

  useEffect(
    () => {
      // console.log('v', v)
      if(field.key) {
        context.query[running_key] = {
          get: () => v,
          set: (new_val) => onChange_internal(new_val)
        }
      }
    }, [field, context, v, onChange_internal]
  );

  useImperativeHandle(
    ref, 
    () => (
      {
        get : (validate=true) => {
          const getVal = getProp('autoGenerate', field, () => v)
          const val = getVal(field)
          const [valid, message] = validateField(field, val)
          if(validate)
            setValidationError(valid ? undefined : message)

          if(!field.key)
            return {
              data: undefined
            }

          return {
            data: {
              [field.key] : val
            },
            validation : {
              fine : {
                [field.key] : [valid, message, field.name]
              },
              has_errors : !valid
            }
          }
        },
      }
    ), [field, v, isFieldEditablePlus]
  )

  const ctx = useMemo(
    () => (
      {
        ...context,
        running_key,
        pubsub
      }
    ), 
    [context, running_key, pubsub]
  )

  useEffect(
    () => {
      // console.log('mounted')
      return () => {
        // console.log('un-mounted')
      }
    }, []
  )

  return (
  <field.comp 
    field={field} 
    value={v} 
    error={validationError} 
    setError={setValidationError}
    onChange={onChange_internal} 
    context={ctx}
    disabled={!isFieldEditablePlus()} 
    {...field.comp_params} />
  )
    
})

const Div = ({...rest}) => (<div {...rest}/>)

const FieldsViewInternal = forwardRef(
  
  <V, C, O,>(
    { 
      field, value, className, context, running_key, isViewMode=false, ...rest
    }: FieldNodeViewParams<V, C, O>, 
    ref
  ) => {
    
  running_key = compute_running_key(running_key, field.key)
    
  const refs = useRef([]);

  useImperativeHandle(
    ref, 
    () => (
      {
        get : (validate=true) => {

          const refs_data = refs.current.map(
            r => r.get(validate)
          ).filter(
            d => d.data && d.data!==undefined
          )

          const inner_data = refs_data.reduce(
            (p, c) => ({...p, ...c?.data}), {})
          const inner_validation_fine = refs_data.reduce(
            (p, c) => ({...p, ...c?.validation.fine}), {})
          const has_errors = refs_data.reduce(
            (p, c) => ( p || c.validation.has_errors), false)

          return {
            data : field.key ? { [field.key] : inner_data } : inner_data,
            validation : {
              fine : field.key ? { [field.key] : inner_validation_fine } : inner_validation_fine,
              has_errors : has_errors
            }
          }
        }
      }
    ), [field]
  );

  let Render = field.fields.map(
    (f, ix) => {
      let vv = f.key ? value?.[f.key] : value
      const CompTarget = f.fields ? FieldsViewInternal : FieldViewInternal
      return (
        <CompTarget 
          ref={(el: any) => refs.current[ix] = el} 
          running_key={running_key}
          key={`${running_key}_${ix}`} 
          field={f} 
          value={vv} 
          isViewMode={isViewMode} 
          context={context}
        />
      )
    }
  )

  const Layout = field.comp ?? Div
  const { 
    className : clsName, 
    ...rest_comp_params 
  } = field.comp_params ?? {};
  const combined_className = `${className} ${clsName} 
    ${isViewMode ? 'pointer-events-none' : ''}`;

  useEffect(
    () => {
      // console.log('MOUNT')
      return () => {
        // console.log('UN-mounted')
      }
    }, []
  )

  return (
    <Layout 
      {...rest_comp_params} 
      field={field} 
      value={value} 
      children={Render} 
      className={combined_className} 
    />
  ) 
})

const FieldsView = forwardRef(

  <V, EC,>(
    { 
      field, value, className, context, 
      isViewMode=false, ...rest
    }: FieldViewParams<V, EC>, 
    ref
  ) => {

    useEffect(
      () => {
        pubsub.dispatch(EVENT_REFRESH)
      }, [value]
    )

    const ctx: FieldContextData<V> = useMemo(
      () => {
        return {
          ...(context ?? {}), 
          query: {
            all: {
              get: (validate=false) => ref.current.get(validate)
            }
          },
          data: value
        }
      }, [context, value]
    );

    return (
      <FieldsViewInternal 
        ref={ref} 
        field={field} 
        value={value} 
        className={className} 
        context={ctx} 
        running_key={undefined} 
        isViewMode={isViewMode} 
        {...rest} 
      />
    )
  }
)

export default FieldsView;