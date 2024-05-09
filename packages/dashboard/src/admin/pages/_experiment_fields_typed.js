


/**
 * @template T
 * @template {(keyof T) | undefined} Key
 * 
 * @typedef {((fb: FieldBuilder<Value<T, Key>>) => FieldDataBuilt<T, Key>) | FieldDataBuilt<T, Key>} FieldBuilderProvider
 * typedef {import('@/admin/comps/fields-view.jsx').FieldData<T>} FieldBuilderProvider
 * typedef {(fb: FieldBuilder<T>) => import('@/admin/comps/fields-view.jsx').FieldData<T>} FieldBuilderProvider
 */

/**
 * @template T
 * @template {(keyof T) | undefined} Key
 * 
 * @typedef {import('@/admin/comps/fields-view.jsx').FieldData<T, Key>} FieldDataBuilt
 */


/**
 * @template {object} T
 * @template {(keyof T)} Key
 * 
 * @typedef {Key extends undefined ? T : T[Key]} Value
 */



/** @type {Value<{a: 1, b:2}, 'a'>} */
let aa;

/**
 * @template T
 */
class FieldBuilder {


  o = {}

  /**
   * 
   * @param {FieldDataBuilt<T, undefined>} field 
   */
  constructor(field) {
    this.o = {
      key: undefined,
      ...field
    };
  }


  /**
   * @template {(keyof T) | undefined} KeyLocal
   * 
   * @param {KeyLocal} key
   * @param {FieldBuilderProvider<T, KeyLocal>} provider 
   */
  add(key, provider) {
    this.o.fields = this.o.fields ?? [];
    let node;

    if(typeof provider === 'function') {
      let fb_new = /** @type {FieldBuilder<Value<T, KeyLocal>>} */ (new FieldBuilder({key}));

      const result = provider(fb_new);

      node = {
        ...(fb_new.o),
        ...result
      }
    } else {
      node = {
        ...provider
      }
    }

    this.o.fields.push(
      {
        key,
        ...node
      }
    );

    return this;
  }
}

const test = {
  a: {
    a1: {
      a11: 'a11',
      a12: 'a12',
    },
    a2: {
      a21: 'a21',
      a22: 'a22',
    },
    a3: {
      a31: 'a31',
      a32: 'a32',
    }
  }
}


// const a = /** @type {FieldBuilder<typeof test>} */ 
const a = /** @type {FieldBuilder<import('@storecraft/core/v-api').OrderData>} */ 
(
  new FieldBuilder(
    {
      comp: ({value, context}) => {},
      defaultValue: null

    }
  )
)
.add(
  'contact', 
  (fb) => {

    fb.add(
      'email',
      {
        comp: ({value, context}) => {},
        defaultValue: null
      }
    )
    .add(
      'customer_id',
      {}
      
    )

    return {
      comp: ({value, context}) => {},
      defaultValue: undefined
    }
  }
)
.add(
  'address', {
    comp: ({value, context}) => {},
    defaultValue: null

  }
)
.add(
  undefined, {
    comp: ({value, context}) => {},
    defaultValue: null

  }
)

// .add(
//   'a2', 
//   fb => {
//     return {
//       // comp: ({value, context}) => {},
//     }
//   }
// )
// .add(
//   'a3', 
//   fb => {
//     return fb.add(
//       ''
//     )
//   }
// )
// .add('')

// console.log(a)
console.log(JSON.stringify(a, null,2))


