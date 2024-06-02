import React from "react"

/**
 * Serialize React element to JSON string
 *
 * @param {ReactNode} element
 * @returns {string}
 */
export function serialize(element) {
  const replacer = (key, value) => {
    switch (key) {
      case "_owner":
      case "_store":
      case "ref":
      case "key":
        return
      default:
        return value
    }
  }

  return JSON.stringify(element, replacer)
}

/**
 * Deserialize JSON string to React element
 *
 * @param {string|object} data
 * @param {object?} options
 * @param {object?} options.components
 * @param {function?} options.reviver
 * @returns {ReactNode}
 */
export function deserialize(data, options) {
  if (typeof data === "string") {
    data = JSON.parse(data)
  }
  if (data instanceof Object) {
    return deserializeElement(data, options)
  }
  throw new Error("Deserialization error: incorrect data type")
}

function deserializeElement(element, options = {}, key) {
  let { components = {}, reviver } = options

  if (typeof element !== "object") {
    return element
  }

  if (element === null) {
    return element
  }

  if (element instanceof Array) {
    return element.map((el, i) => deserializeElement(el, options, i))
  }

  // Now element has following shape { type: string, props: object }

  let { type, props } = element

  if (typeof type !== "string") {
    throw new Error("Deserialization error: element type must be string")
  }

  type = components[type] || type.toLowerCase()

  if (props.children) {
    props = { ...props, children: deserializeElement(props.children, options) }
  }

  if (reviver) {
    ;({ type, props, key, components } = reviver(type, props, key, components))
  }

  return React.createElement(type, { ...props, key })
}