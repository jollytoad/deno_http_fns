/**
 * A Request handler that can take a custom set of context arguments following
 * the first Request argument, and return a Response or an indicator to Skip
 * to the next handler.
 *
 * The Deno standard `Handler` is equiv to `CustomHandler<[ConnInfo], Response>`.
 */
export type CustomHandler<in A extends Args = Args, out R = Response | Skip> = (
  request: Request,
  ...data: A
) => R | Promise<R>;

/**
 * The base type of a the handler context arguments.
 */
export type Args = readonly unknown[];

/**
 * A response from a handler indicating it that handling should be delegated
 * to the next handler.
 */
export type Skip = null;
