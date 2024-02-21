const CONTENT_TYPE = 'content-type';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_TEXT = 'text/plain';
const CONTENT_TYPE_OCTET_STREAM = 'application/octet-stream';
const CONTENT_TYPE_FORM_URL_ENCODED = 'application/x-www-form-urlencoded';

/**
 * @typedef {import("./public.d.ts").VPolkaRequest} VPolkaRequest
 * @typedef {import("./public.d.ts").VPolkaResponse} VPolkaResponse
 */

/**
 * 
 * @param {VPolkaRequest} req 
 * @param {string} match_type 
 */
const is_type = (req, match_type) => {
  return (req.headers.get(CONTENT_TYPE) ?? '').includes(match_type)
}

/**
 */
export const json = () => {
  /**
   * @param {VPolkaRequest} req
   * @param {VPolkaResponse} res
   */
  return async (req, res) => {
    try {
      if(is_type(req, CONTENT_TYPE_JSON))
        req.parsedBody = await req.json();
    } catch (e) {}
  }
}

/**
 */
export const text = () => {
  /**
   * @param {VPolkaRequest} req
   * @param {VPolkaResponse} res
   */
  return async (req, res) => {
    if(is_type(req, CONTENT_TYPE_TEXT))
      req.parsedBody = await req.text();
  }
}

/**
 */
export const raw_blob = () => {
  /**
   * @param {VPolkaRequest} req
   * @param {VPolkaResponse} res
   */
  return async (req, res) => {
    if(is_type(req, CONTENT_TYPE_OCTET_STREAM))
      req.parsedBody = await req.blob();
  }
}

/**
 */
export const raw_buffer = () => {
  /**
   * @param {VPolkaRequest} req
   * @param {VPolkaResponse} res
   */
  return async (req, res) => {
    if(is_type(req, CONTENT_TYPE_OCTET_STREAM))
      req.parsedBody = await req.arrayBuffer();
  }
}

/**
 * 
 * @param {boolean} parse_to_object instead of FormData, parse into regular Object dictionary
 * @returns 
 */
export const urlencoded = (parse_to_object=true) => {
  /**
   * @param {VPolkaRequest} req
   * @param {VPolkaResponse} res
   */
  return async (req, res) => {
    if(is_type(req, CONTENT_TYPE_FORM_URL_ENCODED)) {
      let formdata = await req.formData();
      if(parse_to_object) {
        req.parsedBody = Object.fromEntries(formdata.entries());
      } else {
        req.parsedBody = formdata;
      }
    }
  }
}


