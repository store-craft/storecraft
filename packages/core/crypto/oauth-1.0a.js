// if (typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
//   module.exports = OAuth;
// }
/**
 * @import { OAuthClass } from "./oauth-1.0a.types.js";
 */



/**
 * 
 * @type {OAuthClass}  
 */
export class OAuthV1 {

  /** @param {import("./oauth-1.0a.types.js").OAuthNamespace.Options} opts  */
  constructor(opts) {
  
    if(!(this instanceof OAuthV1)) {
        return new OAuthV1(opts);
    }

    if(!opts) {
        opts = {};
    }

    if(!opts.consumer) {
        throw new Error('consumer option is required');
    }

    this.consumer            = opts.consumer;
    this.nonce_length        = opts.nonce_length || 32;
    this.version             = opts.version || '1.0';
    this.parameter_seperator = opts.parameter_seperator || ', ';
    this.realm               = opts.realm;

    if(typeof opts.last_ampersand === 'undefined') {
        this.last_ampersand = true;
    } else {
        this.last_ampersand = opts.last_ampersand;
    }

    // default signature_method is 'PLAINTEXT'
    this.signature_method = opts.signature_method || 'PLAINTEXT';

    if(this.signature_method == 'PLAINTEXT' && !opts.hash_function) {
        opts.hash_function = async function(base_string, key) {
            return key;
        }
    }

    if(!opts.hash_function) {
        throw new Error('hash_function option is required');
    }

    this.hash_function = opts.hash_function;
    this.body_hash_function = opts.body_hash_function || this.hash_function;
  }

  /** @type {OAuthClass["authorize"]} */
  authorize = async (request, token) => {
    var oauth_data = {
      oauth_consumer_key: this.consumer.key,
      oauth_nonce: this.getNonce(),
      oauth_signature_method: this.signature_method,
      oauth_timestamp: this.getTimeStamp(),
      oauth_version: this.version
    };

    if(!token) {
      token = {};
    }

    if(token.key !== undefined) {
      oauth_data.oauth_token = token.key;
    }

    if(!request.data) {
      request.data = {};
    }

    if(request.includeBodyHash) {
      oauth_data.oauth_body_hash = this.getBodyHash(request, token.secret)
    }

    oauth_data.oauth_signature = await this.getSignature(request, token.secret, oauth_data);

    return oauth_data;
  }

  
  /** @type {OAuthClass["getSignature"]} */
  getSignature = (request, token_secret, oauth_data) => {
    return this.hash_function(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
  }

  /** @type {OAuthClass["getBodyHash"]} */
  getBodyHash = (request, token_secret) => {
    var body = typeof request.data === 'string' ? request.data : JSON.stringify(request.data)

    if (!this.body_hash_function) {
      throw new Error('body_hash_function option is required');
    }

    return this.body_hash_function(body, this.getSigningKey(token_secret))
  }

  /** @type {OAuthClass["getBaseString"]} */
  getBaseString = (request, oauth_data) => {
    return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
  }

  /** @type {OAuthClass["getParameterString"]} */
  getParameterString = (request, oauth_data) => {
    var base_string_data;
    if (oauth_data.oauth_body_hash) {
        base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.deParamUrl(request.url))));
    } else {
        base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));
    }

    var data_str = '';

    //base_string_data to string
    for(var i = 0; i < base_string_data.length; i++) {
        var key = base_string_data[i].key;
        var value = base_string_data[i].value;
        // check if the value is an array
        // this means that this key has multiple values
        if (value && Array.isArray(value)){
          // sort the array first
          value.sort();

          var valString = "";
          // serialize all values for this key: e.g. formkey=formvalue1&formkey=formvalue2
          value.forEach((function(item, i){
            valString += key + '=' + item;
            if (i < value.length){
              valString += "&";
            }
          }).bind(this));
          data_str += valString;
        } else {
          data_str += key + '=' + value + '&';
        }
    }

    //remove the last character
    data_str = data_str.substr(0, data_str.length - 1);
    return data_str;
  }

  /** @type {OAuthClass["getSigningKey"]} */
  getSigningKey = (token_secret) => {
    token_secret = token_secret || '';

    if(!this.last_ampersand && !token_secret) {
        return this.percentEncode(this.consumer.secret);
    }

    return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
  }

  /** @type {OAuthClass["getBaseUrl"]} */
  getBaseUrl = (url) => {
    return url.split('?')[0];
  }

  /** @type {OAuthClass["deParam"]} */
  deParam = (string) => {
    var arr = string.split('&');
    var data = {};

    for(var i = 0; i < arr.length; i++) {
        var item = arr[i].split('=');

        // '' value
        item[1] = item[1] || '';

        // check if the key already exists
        // this can occur if the QS part of the url contains duplicate keys like this: ?formkey=formvalue1&formkey=formvalue2
        if (data[item[0]]){
          // the key exists already
          if (!Array.isArray(data[item[0]])) {
            // replace the value with an array containing the already present value
            data[item[0]] = [data[item[0]]];
          }
          // and add the new found value to it
          data[item[0]].push(decodeURIComponent(item[1]));
        } else {
          // it doesn't exist, just put the found value in the data object
          data[item[0]] = decodeURIComponent(item[1]);
        }
    }

    return data;
  }

  /** @type {OAuthClass["deParamUrl"]} */
  deParamUrl = (url) => {
    var tmp = url.split('?');

    if (tmp.length === 1)
        return {};

    return this.deParam(tmp[1]);
  }

  /** @type {OAuthClass["percentEncode"]} */
  percentEncode = (str) => {
    return encodeURIComponent(str)
        .replace(/\!/g, "%21")
        .replace(/\*/g, "%2A")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
  }

  /**
  * Percent Encode Object
  * @param  {Object} data
  * @return {Object} percent encoded data
  */
  percentEncodeData = (data) => {
    var result = {};

    for(var key in data) {
        var value = data[key];
        // check if the value is an array
        if (value && Array.isArray(value)){
          var newValue = [];
          // percentEncode every value
          value.forEach((function(val){
            newValue.push(this.percentEncode(val));
          }).bind(this));
          value = newValue;
        } else {
          value = this.percentEncode(value);
        }
        result[this.percentEncode(key)] = value;
    }

    return result;
  }

  /** @type {OAuthClass["toHeader"]} */
  toHeader = (oauth_data) => {
    var sorted = this.sortObject(oauth_data);

    var header_value = 'OAuth ';

    if (this.realm) {
        header_value += 'realm="' + this.realm + '"' + this.parameter_seperator;
    }

    for(var i = 0; i < sorted.length; i++) {
        if (sorted[i].key.indexOf('oauth_') !== 0)
            continue;

        header_value += this.percentEncode(sorted[i].key) + '="' + this.percentEncode(sorted[i].value) + '"' + this.parameter_seperator;
    }

    return {
        Authorization: header_value.substr(0, header_value.length - this.parameter_seperator.length) //cut the last chars
    };
  }

  /** @type {OAuthClass["getNonce"]} */
  getNonce = () => {
    var word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for(var i = 0; i < this.nonce_length; i++) {
        result += word_characters[parseInt(String(Math.random() * word_characters.length), 10)];
    }

    return result;
  };

  /** @type {OAuthClass["getTimeStamp"]} */
  getTimeStamp = () => {
    return parseInt(String(new Date().getTime()/1000), 10);
  };

  // ////////////////////// HELPER FUNCTIONS //////////////////////

  /** @type {OAuthClass["mergeObject"]} */
  mergeObject = (obj1, obj2) => {
    obj1 = obj1 || {};
    obj2 = obj2 || {};

    var merged_obj = obj1;
    for(var key in obj2) {
        merged_obj[key] = obj2[key];
    }
    return merged_obj;
  };

  /** @type {OAuthClass["sortObject"]} */
  sortObject = (data) => {
    var keys = Object.keys(data);
    var result = [];

    keys.sort();

    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result.push({
            key: key,
            value: data[key],
        });
    }

    return result;
  };

}

