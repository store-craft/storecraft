import { useCallback, useEffect, useMemo, useState } from 'react'
import { Editor, useMonaco} from "@monaco-editor/react";
import useDarkMode from '../hooks/useDarkMode.js';
import CapsulesView from './capsules-view.jsx';


const info_example = {
  general_store_name: 'Wush Wush Games',
  general_store_website: 'https://wush.games/',
  general_store_logo_url: undefined,
  general_store_description: 'We sell retro video games',
  general_confirm_email_base_url: 'https://wush.games/confirm-email'
}

/**
 * @type {import('@storecraft/core/v-api').OrderData}
 */
const example_order = {
  contact: {
    email: 'john@doe.com',
    firstname: 'John',
    phone_number: '000-000-000',
    customer_id: 'cus_65f2ae6e8bf30e6cd0ca95fa'
  },
  address: {

  },
  "status": {
    "checkout": {
      "id": 0,
      "name2": "created",
      "name": "Created"
    },
    "payment": {
      "id": 1,
      "name": "Authorized",
      "name2": "authorized"
    },
    "fulfillment": {
      "id": 0,
      "name2": "draft",
      "name": "Draft"
    }
  },
  "pricing": {
    evo: [
      {
        quantity_discounted: 0,
        quantity_undiscounted: 11,
        subtotal: 1100,
        total: 1150
      },
      {
        quantity_discounted: 2,
        total_discount: 100,
        quantity_undiscounted: 9,
        discount: {
          "active": true,
          "handle": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
          "title": "50% OFF Bundle: robot arms and legs (not recursive)",
          "priority": 0,
          "application": {
            "id": 0,
            "name": "Automatic",
            "name2": "automatic"
          },
          "info": {
            "details": {
              "meta": {
                "id": 4,
                "type": "bundle",
                "name": "Bundle Discount"
              },
              "extra": {
                "fixed": 0,
                "percent": 50,
                "recursive": false
              }
            },
            "filters": [
              {
                "meta": {
                  "id": 4,
                  "type": "product",
                  "op": "p-in-tags",
                  "name": "Product has Tag"
                },
                "value": [
                  "robot_arm"
                ]
              },
              {
                "meta": {
                  "id": 4,
                  "type": "product",
                  "op": "p-in-tags",
                  "name": "Product has Tag"
                },
                "value": [
                  "robot_leg"
                ]
              }
            ]
          }
        },
        discount_code: 'discount-bundle-50-off-robot-arms-and-legs-not-recursive',
        subtotal: 1000,
        total: 1050
      }
    ],
    uid: undefined,
    shipping_method: { title: '', handle: '', price: 50 },
    subtotal_discount: 100,
    subtotal_undiscounted: 1100,
    subtotal: 1000,
    total: 1050,
    quantity_total: 11,
    quantity_discounted: 2,
    errors: []
  },
  "line_items": [
    {
      id: 'robot-leg-white', qty: 3, 
      data: { 
        tags: ['robot_leg'], 
        qty: 100, 
        active: true, title: '', 
        price: 100 
      }
    },
    {
      id: 'just-for-disruption', qty: 5, 
      data: { 
        tags: ['would-not-be-discounted'], 
        qty: 100, 
        active: true, title: '', 
        price: 100 
      }
    },
    {
      id: 'robot-arm-red', qty: 2, 
      data: { 
        tags: ['robot_arm'], 
        qty: 100, 
        active: true, title: '', 
        price: 100 
      }
    },
    {
      id: 'robot-arm-green', qty: 1, 
      data: { 
        tags: ['robot_arm'], 
        qty: 100, 
        active: true, title: '', 
        price: 100 
      }
    },
  ],
  "shipping_method": {
    "handle": "ship-fast",
    "title": "ship fast",
    "price": 50
  },
  "id": "order_65d774c6445e4581b9e34c11",
  "created_at": "2024-02-22T16:22:30.095Z",
  "updated_at": "2024-02-22T16:22:30.095Z"
}

/**
 * @type {import('@storecraft/core/v-api').CustomerType}
 */
const example_customer = {
  "email": "john@dow.com",
  "firstname": "John",
  "lastname": "Dow",
  "id": "cus_65f2ae6e8bf30e6cd0ca95fa",
}


const capsules = [
  {
    name: 'customer',
    example: JSON.stringify({
      customer: example_customer,
      info: info_example
    })
  },
  {
    name: 'order',
    example: JSON.stringify({
      order: example_order,
      info: info_example
    })
  }
]


/**
 * @typedef {import('./fields-view.jsx').FieldLeafViewParams<
 *   import('@storecraft/core/v-api').TemplateType["reference_example_input"]> 
 * } TemplateTemplateParams
 * 
 * @param {TemplateTemplateParams & 
 *  Omit<
 *    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 
 *    'onChange'
 *  >} params
 */
export const TemplateExampleInput = (
  { 
    field, context, setError, value={}, onChange, ...rest 
  }
) => {

  const monaco = useMonaco();
  const [example, setExample] = useState(value);
  const { darkMode } = useDarkMode();
  /** @type {Parameters<Editor>["0"]["onChange"]} */
  const editor_onChange = useCallback(
    (value, ev) => {
      setError(undefined);

      try {
        let value_parsed = JSON.parse(value);

        setExample(value_parsed);
        onChange(value_parsed);
      } catch(e) {
        setError(e?.message ?? 'JSON Error');
      }
      
    }, [onChange]
  );

 
  const source = useMemo(
    () => {
      try {
        return JSON.stringify(example, null, 2);
      } catch(e) {
        return e
      }
    }, [example]
  );

  useEffect(
    () => {
      monaco && monaco.editor.defineTheme(
        'coblat',
        {
          "base": "vs-dark",
          "inherit": true,
          "rules": [
            {
              "background": "002240",
              "token": ""
            },
            {
              "foreground": "e1efff",
              "token": "punctuation - (punctuation.definition.string || punctuation.definition.comment)"
            },
            {
              "foreground": "ff628c",
              "token": "constant"
            },
            {
              "foreground": "ffdd00",
              "token": "entity"
            },
            {
              "foreground": "ff9d00",
              "token": "keyword"
            },
            {
              "foreground": "ffee80",
              "token": "storage"
            },
            {
              "foreground": "3ad900",
              "token": "string -string.unquoted.old-plist -string.unquoted.heredoc"
            },
            {
              "foreground": "3ad900",
              "token": "string.unquoted.heredoc string"
            },
            {
              "foreground": "0088ff",
              "fontStyle": "italic",
              "token": "comment"
            },
            {
              "foreground": "80ffbb",
              "token": "support"
            },
            {
              "foreground": "cccccc",
              "token": "variable"
            },
            {
              "foreground": "ff80e1",
              "token": "variable.language"
            },
            {
              "foreground": "ffee80",
              "token": "meta.function-call"
            },
            {
              "foreground": "f8f8f8",
              "background": "800f00",
              "token": "invalid"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "text source"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "string.unquoted.heredoc"
            },
            {
              "foreground": "ffffff",
              "background": "223545",
              "token": "source source"
            },
            {
              "foreground": "80fcff",
              "fontStyle": "italic",
              "token": "entity.other.inherited-class"
            },
            {
              "foreground": "9eff80",
              "token": "string.quoted source"
            },
            {
              "foreground": "80ff82",
              "token": "string constant"
            },
            {
              "foreground": "80ffc2",
              "token": "string.regexp"
            },
            {
              "foreground": "edef7d",
              "token": "string variable"
            },
            {
              "foreground": "ffb054",
              "token": "support.function"
            },
            {
              "foreground": "eb939a",
              "token": "support.constant"
            },
            {
              "foreground": "ff1e00",
              "token": "support.type.exception"
            },
            {
              "foreground": "8996a8",
              "token": "meta.preprocessor.c"
            },
            {
              "foreground": "afc4db",
              "token": "meta.preprocessor.c keyword"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype entity"
            },
            {
              "foreground": "73817d",
              "token": "meta.sgml.html meta.doctype string"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing entity"
            },
            {
              "foreground": "73817d",
              "token": "meta.xml-processing string"
            },
            {
              "foreground": "9effff",
              "token": "meta.tag"
            },
            {
              "foreground": "9effff",
              "token": "meta.tag entity"
            },
            {
              "foreground": "9effff",
              "token": "meta.selector.css entity.name.tag"
            },
            {
              "foreground": "ffb454",
              "token": "meta.selector.css entity.other.attribute-name.id"
            },
            {
              "foreground": "5fe461",
              "token": "meta.selector.css entity.other.attribute-name.class"
            },
            {
              "foreground": "9df39f",
              "token": "support.type.property-name.css"
            },
            {
              "foreground": "f6f080",
              "token": "meta.property-group support.constant.property-value.css"
            },
            {
              "foreground": "f6f080",
              "token": "meta.property-value support.constant.property-value.css"
            },
            {
              "foreground": "f6aa11",
              "token": "meta.preprocessor.at-rule keyword.control.at-rule"
            },
            {
              "foreground": "edf080",
              "token": "meta.property-value support.constant.named-color.css"
            },
            {
              "foreground": "edf080",
              "token": "meta.property-value constant"
            },
            {
              "foreground": "eb939a",
              "token": "meta.constructor.argument.css"
            },
            {
              "foreground": "f8f8f8",
              "background": "000e1a",
              "token": "meta.diff"
            },
            {
              "foreground": "f8f8f8",
              "background": "000e1a",
              "token": "meta.diff.header"
            },
            {
              "foreground": "f8f8f8",
              "background": "4c0900",
              "token": "markup.deleted"
            },
            {
              "foreground": "f8f8f8",
              "background": "806f00",
              "token": "markup.changed"
            },
            {
              "foreground": "f8f8f8",
              "background": "154f00",
              "token": "markup.inserted"
            },
            {
              "background": "8fddf630",
              "token": "markup.raw"
            },
            {
              "background": "004480",
              "token": "markup.quote"
            },
            {
              "background": "130d26",
              "token": "markup.list"
            },
            {
              "foreground": "c1afff",
              "fontStyle": "bold",
              "token": "markup.bold"
            },
            {
              "foreground": "b8ffd9",
              "fontStyle": "italic",
              "token": "markup.italic"
            },
            {
              "foreground": "c8e4fd",
              "background": "001221",
              "fontStyle": "bold",
              "token": "markup.heading"
            }
          ],
          "colors": {
            "editor.foreground": "#FFFFFF",
            "editor.background": "#1e293b",
            "editor.selectionBackground": "#B36539BF",
            "editor.lineHighlightBackground": "#00000059",
            "editorCursor.foreground": "#FFFFFF",
            "editorWhitespace.foreground": "#FFFFFF26"
          }
        }
      )
    }, [monaco]
  );



  return (
<div {...rest} >
  <div className='flex flex-col w-full gap-5'>

    <div className='flex flex-row flex-wrap gap-3'>
      <CapsulesView 
          tags={capsules} 
          name_fn={it => it.name} 
          onClick={it => { editor_onChange(it.example, null) }} />

    </div>
  
    <Editor
        options={{tabSize: 2}}
        width='100%'
        height="200px"
        className='rounded-md border shelf-border-color overflow-clip'
        onChange={editor_onChange}
        value={source}
        theme={darkMode ? 'coblat' : 'light'}
        defaultLanguage='json'
        // defaultValue="// some comment"
        // onMount={handleEditorDidMount}
      />

  </div>
</div>
  )
}

export default TemplateExampleInput