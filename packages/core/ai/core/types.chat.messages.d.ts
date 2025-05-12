
/**
 * @description text content type for messages
 */
export type content_text = { 
  type: 'text', 
  content: string 
};

/**
 * @description partial text content type for messages
 */
export type content_delta_text = { 
  type: 'delta_text', 
  content: string 
};

/**
 * @description tool use content type for messages
 */
export type content_tool_use = { 
  type: 'tool_use', 
  content: { 
    name?: string, title?: string, id?: string, 
    arguments?: Record<string, any>, 
  }[] 
};

/**
 * @description tool result content type for messages
 */
// export type content_tool_result = { 
export type content_tool_result<T extends any = any> = { 
  type: 'tool_result', 
  content: { 
    data: { result?: T, error?: any }, 
    id?: string, 
    name: string 
  } 
};

/**
 * @description image content type for messages
 */
export type content_image = { type: 'image', content: string };

/**
 * @description json content type for messages
 */
export type content_json = { type: 'json', content: string };

/**
 * @description object content type for messages
 */
export type content_object = { type: 'object', content: object };

/**
 * @description error content type for messages
 */
export type content_error = { 
  type: 'error', 
  content: { 
    code?: string, message?: string
  } | string
};

/** @description A general content type from and to user */
export type content = | content_text | content_delta_text 
  | content_tool_use | content_tool_result | content_image
  | content_json | content_object | content_error;

/**
 * @description Unified message type translatable to and 
 * from LLM native message
 */                      
export type Message = {
  /**
   * @description role of the message
   */
  role: 'user' | 'assistant',
  /**
   * @description contents of the message
   */
  contents: content[];
}

