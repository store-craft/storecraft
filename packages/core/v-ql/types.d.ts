export namespace VQL {
  export type AND = '&';
  export type OR = '|';
  export type NOT = '!';

  export type OP = AND | OR | NOT;
  export type Node = string | {
    op: string;
    args: Node[];
    group?: boolean;
  }

  export type AST = Node;
}
