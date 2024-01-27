/**
 * Boolean Algebra Parser for PEG.js.
 * Converts Boolean algebra into machine-parsable LISP-like S-expressions.
 */

// An expression.
//equation
//  = output:variable "=" expression:expression ";"? { return ['define', output, expression]}

{{
function merge(op, l, r) {
  const not_groups = !(Boolean(l?.group) || Boolean(r?.group));
  const similar_op = (l?.op!=='LEAF' ? l.op===op : true) && (r?.op!=='LEAF' ? r.op===op : true);
  if(!(not_groups && similar_op))
  	return [l, r];
  const new_args = [...l?.args??[l], ...r?.args??[r]];
  return new_args;
}

function con(op, l, r) {
  return { op, args:merge(op, l, r)}
}

}}

// An alias for our 
expression "expression"
  = or_term

// A sum terms, which contains only OR operations and simpler terms.
or_term "sum term"
  = left:and_term "|" right:or_term { return con('|', left, right); }
  / and_term


// A product term, which contains only the ANDs of simpler terms.
// Note that this also supports _implied_ AND operations.
and_term "product term"
  = left:subexpression "&"? right:and_term { return con('&', left, right); }
  / subexpression

// An potentially-inverted term, such as a literal or inverted subexpression.
subexpression "subexpression"
  = whitespace "-" term:term  whitespace { return {op:'!', args:[term]} }
  / term

// A primary term, such as expression or inverted subexpression.
term "term"
  = variable 
  / whitespace "(" expression:expression ")" whitespace { 
  		if(typeof expression!=='string') expression.group=true;
        return expression; 
 	}

//Our basic variables.
variable "variable"
  = whitespace characters:("'"[^\']+"'" / '"'[^\"]+'"' / [^\"\' \(\)\|\&]+) whitespace { 
  return { op:'LEAF', value: text().trim()}; 
  }

//variable "variable"
//  = whitespace characters:[^\" \(\)\|\&]+ whitespace { return { op:'LEAF', value: text().trim()}; }


//A collection of whitespace characters, which shouldn't matter to our expressions.
whitespace "whitespace character(s)"
  = [ ]*
  