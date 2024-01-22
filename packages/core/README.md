
## sqlite query
```sql
DROP TABLE if EXISTS object;
CREATE TABLE IF NOT EXISTS objects (
	id INTEGER PRIMARY KEY,
	name TEXT
);

DROP TABLE if EXISTS terms;
CREATE TABLE IF NOT EXISTS terms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	obj_id INTEGER,
	name TEXT
);

```

```sql

INSERT OR IGNORE INTO objects (id, name) VALUES (1, "prod_1");
INSERT  OR IGNORE INTO objects (id, name) VALUES (2, "prod_2");

INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (1, 'a0');
INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (1, 'a1');
INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (1, 'b0');
INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (1, 'b1');

INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (2, 'a1');
INSERT  OR IGNORE INTO terms (obj_id, name) VALUES (2, 'b1');
```

```sql

SELECT * from objects as o
  WHERE
  EXISTS(
    SELECT t.name
      FROM terms as t
      WHERE t.obj_id=o.id
      AND 
      EXISTS(
        SELECT t.name
          FROM terms as t
          WHERE t.obj_id=o.id 
          AND 
          EXISTS(
            SELECT t.name
              FROM terms as t
              WHERE t.obj_id=o.id AND t.name LIKE 'b0'
          )
          OR
          EXISTS(
            SELECT t.name
              FROM terms as t
              WHERE t.obj_id=o.id AND t.name LIKE 'b1'
          )
      )
      AND 
      EXISTS(
        SELECT t.name
          FROM terms as t
          WHERE t.obj_id=o.id
          AND 
          EXISTS(
            SELECT t.name
              FROM terms as t
              WHERE t.obj_id=o.id AND t.name LIKE 'a0'
          )
          OR
          EXISTS(
            SELECT t.name
              FROM terms as t
              WHERE t.obj_id=o.id AND t.name LIKE 'a1'
          )

      )
  )
```


## mongo query
```js
{
 $and: [
  { handle: {$regex: 'tom'}},
  {
     values: {$regex: 'a0'}
    },
    {
     values: 'a1'
    }
   ]
}
```

```js
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
  const similar_op = (l?.op ? l.op===op : true) && (r?.op ? r.op===op : true);
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
  = whitespace "-" term:term  whitespace { return {op:'!', args:term} }
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
  = whitespace characters:[%=\:\*\>A-Za-z0-9\[\]_]+ whitespace { return characters.join(""); }

//A collection of whitespace characters, which shouldn't matter to our expressions.
whitespace "whitespace character(s)"
  = [ ]*
```