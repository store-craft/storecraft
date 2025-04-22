export namespace BOOLQL {
  export type AND = '&';
  export type OR = '|';
  export type NOT = '!';
  export type LEAF = 'LEAF';

  export type OP = AND | OR | NOT | LEAF;
  export type Node = {
    op: OP;
    // this is children for non leaf nodes
    args: Node[];
    /** This is value For leaf nodes */
    value?: string;
    group?: boolean;
  };

  export type AST = Node;
}

export * from './index.js';
