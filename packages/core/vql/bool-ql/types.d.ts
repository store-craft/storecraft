export namespace BOOLQL {
  export type AND = '&';
  export type OR = '|';
  export type NOT = '!';
  export type LEAF = 'LEAF';

  export type OP = AND | OR | NOT | LEAF;
  export type Node = {
    op: OP;
    args: Node[];
    group?: boolean;
    /** For leaf nodes */
    value?: string;
  };

  export type AST = Node;
}

export * from './index.js';
