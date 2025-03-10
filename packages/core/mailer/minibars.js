'use strict';
// author: udo.schroeter@gmail.com

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

const _m = {
  
  scope : 'data',
  stack : [],
  
  tokenize : function(text='') {
    var tokens = [];
    for(var i = 0; i < text.length; i++) {
      var tkPos = text.indexOf('{{', i);
      if(tkPos === -1) {
        tokens.push({ type : 'text', val : text.slice(i) });
        // console.log(tokens.at(-1))
        i = text.length;
      } 
      else {
        {
          if(text.substr(tkPos, 5) === '{{!--') {
            var tkEnd = text.indexOf('--}}', tkPos);
            tokens.push({ type : 'text', val : text.slice(i, tkPos) });
            i = tkEnd+4;
            continue;
          } else if(text.substr(tkPos, 3) === '{{!') {
            var tkEnd = text.indexOf('}}', tkPos);
            tokens.push({ type : 'text', val : text.slice(i, tkPos) });
            i = tkEnd+2;
            continue;
          }

        }
        var rawField = text.substr(tkPos, 3) === '{{{';
        var closeBy = '}}' + (rawField ? '}' : '');
        var tkEnd = text.indexOf(closeBy, tkPos);
        if(tkEnd === -1) {
          tokens.push({ type : 'text', val : text.slice(i) });
          i = text.length;
        } else {
          if(i < tkPos)
            tokens.push({ type : 'text', val : text.slice(i, tkPos) });
            
          var token = { 
            type : 'field', 
            raw : rawField, 
            val : text.slice(tkPos+closeBy.length, tkEnd), 
            };
            
          var delimHS = token.val.indexOf(' ');
          if(delimHS !== -1) {
            token.params = token.val.slice(delimHS+1);
            token.val = token.val.slice(0, delimHS);
            var delimMap = token.params.indexOf('|');
            if(delimMap !== -1) {
              token.mapTo = token.params.slice(delimMap+1).trim().split(' ');
              token.params = token.params.slice(0, delimMap);
            }
          }

          var prefix = token.val.substr(0, 1);
          if(prefix === '#') {
            token.block = 'start';
            token.val = token.val.slice(1);
          }
          else if(prefix === '/') {
            token.block = 'end';
            token.val = token.val.slice(1);
          }
          
          tokens.push(token);
          i = tkEnd + closeBy.length - 1;
        }
      }
    }
    return(tokens);
  },
  
  utils : {
    
    vnCounter : 0,
    getName : function() {
      return('v'+_m.utils.vnCounter++);
    },
      
    safe : function(raw) {
      if(raw == null) raw = '';
      return((raw +'').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'));
    },
    
    unsafe : function(raw) {
      return(raw || '');
    },
    
    // resolve field from label at compile time
    field : function(label) {
      label = (label || '').trim();
      if(label[0] == '"' && label[label.length-1] == '"') return(JSON.stringify(label.slice(1, -1)));
      if(label == 'this') return(_m.scope);
      if(label[0] == '@') return(label.slice(1));
      var scope = _m.scope;
      var upCnt = 0;
      while(label[0] == '.') {
        // access parent scopes with ..
        if(upCnt > 0 && _m.stack.length >= upCnt) {
          scope = _m.stack[_m.stack.length-upCnt];                    
        }
        upCnt++;
        label = label.slice(1);
      }
      var levels = label.split('.');
      var acc = '';
      levels.forEach(function(fn) {
        if(fn[0] == '/') fn = fn.slice(1);
        acc += '['+JSON.stringify(fn)+']';
      });      
      return(scope+acc);
    },
    
    pushScope : function() {
      _m.stack.push(_m.scope);
      _m.scope = _m.utils.getName();
      return(_m.scope);
    },
    
    popScope : function() {
      _m.scope = _m.stack.pop() || 'data';
      return(_m.scope);
    },
    
  },
  
  // code generators
  gen : {
    
    if_start : function(token) {
      return('if('+_m.utils.field(token.params.trim())+') {');
    },
    
    if_end : function(token) {
      return('}');
    },
    
    unless_start : function(token) {
      return('if(!'+_m.utils.field(token.params.trim())+') {');
    },
    
    unless_end : function(token) {
      return('}');
    },
    
    each_start : function(token) {
      var container = _m.utils.field(token.params.trim());
      var iterVN = _m.utils.getName();
      var scp = _m.utils.pushScope();
      return(
        'if('+container+'&&'+container+'.length>0) '+
        'for(var '+iterVN+'=0;'+iterVN+'<'+container+'.length;'+iterVN+'++) {'+
        'var index='+iterVN+';'+
        'var '+scp+'='+container+'['+iterVN+'];');
    },
    
    each_end : function(token) {
      _m.utils.popScope();
      return('}');
    },
    
    local_mapping : function(token, tm) {
      if(token.mapTo && token.mapTo.length > 0) {
        var mapCode = '';
        for(var i = 0; i < token.mapTo.length; i++) {
          var alias = token.mapTo[i];
          var v = tm[i];
          if(alias && v)
            mapCode += 'var '+alias+' = '+v+';'; 
        }
        return(mapCode);
      } else {
        return('');
      }
    },
    
    properties_start : function(token) {
      var container = _m.utils.field(token.params.trim());
      var iterVN = _m.utils.getName();
      var keyVN = _m.utils.getName();
      var scp = _m.utils.pushScope();
      return(
        'var '+keyVN+'=Object.keys('+container+');'+
        'if('+container+'&&'+keyVN+'.length>0) '+
        'for(var '+iterVN+'=0; '+iterVN+'<'+keyVN+'.length;'+iterVN+'++) {'+
        'var index='+iterVN+';'+
        'var key='+keyVN+'['+iterVN+'];'+
        'var '+scp+'='+container+'[key];'+
        _m.gen.local_mapping(token, [scp, 'key']));
    },
    
    properties_end : function(token) {
      _m.utils.popScope();
      return('}');
    },
    
    with_start : function(token) {
      var container = _m.utils.field(token.params.trim());
      var scp = _m.utils.pushScope();
      return(
        'if('+container+') { '+
        'var '+scp+'='+container+';'+
        _m.gen.local_mapping(token, [scp]));
    },
    
    with_end : function(token) {
      _m.utils.popScope();
      return('}');
    },
    
    'else' : function(token) {
      return('} else {');
    },
    
    log : function(token) {
      return('console.log(_m.utils.safe('+_m.utils.field(token.params)+'));');
    },
    
    _text_f : function(token) {
      return('o += '+JSON.stringify(_m.opt.trim ? token.val.trim() : token.val)+';');
    },
    
    _invoke_synth : function(ct, token) {
      return('o += _m.utils.'+
        (token.raw ? 'unsafe' : 'safe')+
        '('+ct+'['+JSON.stringify(token.val)+']('+_m.utils.field(token.params || 'this')+
        ', '+_m.utils.field('this')+', '+JSON.stringify(token.params)+', data));');
    },
    
    _field_f : function(token, opt) {
      if(token.block == 'start' || token.block == 'end') {
        var genKey = token.val+'_'+token.block;
        if(_m.gen[genKey])
          return(_m.gen[genKey](token));
        else {
          console.log('unrecognized field type', genKey);
          return('');
        }
      }
      if(_m.gen[token.val])
        return(_m.gen[token.val](token));
      if(typeof opt[token.val] == 'function')
        return(_m.gen._invoke_synth('opt', token));
      else {
        return('o += _m.utils.'+
          (token.raw ? 'unsafe' : 'safe')+
          '('+_m.utils.field(token.val)+');');
      }
    },
    
  },
  
  tokensToCode : function(tokens, opt) {
    var code = [];
    
    tokens.forEach(function(t) {
      var handler = _m.gen['_'+t.type+'_f'];
      if(typeof handler != 'function')
        console.log('unrecognized field type', t.type);
      else
        code.push(handler(t, opt));
    });
    
    return(code.join("\n"));
  },
  
  compile: function(text, opt) {
    if (!opt) opt = {};
    _m.opt = opt;
    _m.stack = [];
    _m.scope = 'data';
    var tokens = _m.tokenize((text || '').trim());
    var code = _m.tokensToCode(tokens, opt);
    // console.log('code', code);
    if (_m.stack.length != 0) {
        var e = function() { return 'template error: un-closed blocks'; };
        e.error = e();
        return e;
    } else {
      const templateFunction = new Function('data', '_m', '"use strict"; if (!data) data = {}; var o = ""; ' + code + ' return(o);');
      return function(data) {
          return templateFunction(data, _m);
      };    
    }
  },

  compile_OLD : function(text, opt) {
    if(!opt) opt = {};
    _m.opt = opt;
    _m.stack = [];
    _m.scope = 'data';
    var tokens = _m.tokenize((text || '').trim());
    var code = _m.tokensToCode(tokens, opt);
    //console.log('code', code);
    if(_m.stack.length != 0) {
      var e = function() { return('template error: un-closed blocks'); };
      e.error = e();
      return(e);      
    } else {
      // straight-up string concat seems to be the fastest option
      return(eval('(function(data) { "use strict"; if(!data) data = {}; var o = ""; '+code+' return(o); })'));
    }
  },
  
}

export const Minibars = _m;