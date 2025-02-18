/**
 * A leaf handler in a PathTree, returned only when
 * the path ends on the branch containing this leaf.
 */
export const LEAF: unique symbol = Symbol("leaf");

/**
 * A mid-path (guard) handler in a PathTree, always
 * returned when the path reaches the branch containing
 * this, regardless of whether it's end or not.
 */
export const GUARD: unique symbol = Symbol("guard");

/**
 * A wildcard segment in a PathTree
 */
export const WILD: unique symbol = Symbol("wild");
