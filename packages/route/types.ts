/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Type alias for a pathname part of a URLPattern.
 */
export type PathPattern = string;

/**
 * Define a single URL pattern to match against.
 */
export type SingleRoutePattern =
  | PathPattern
  | URLPatternInit
  | URLPattern;

/**
 * Define one or many URL patterns to match against.
 */
export type RoutePattern =
  | SingleRoutePattern
  | Array<SingleRoutePattern>;

/**
 * A route pattern that can be serialized to JSON.
 */
export type SerializableRoutePattern =
  | PathPattern
  | URLPatternInit
  | Array<PathPattern | URLPatternInit>;

/**
 * A record of method handlers for use with byMethod.
 * This type is designed to aid auto-completion of method names.
 */
export type MethodHandlers<A extends unknown[]> = Partial<
  MethodRecord<(request: Request, ...args: A) => Awaitable<Response | null>>
>;

/**
 * Map HTTP methods to something
 * @private
 */
export type MethodRecord<T> = {
  DELETE: T;
  GET: T;
  HEAD: T;
  OPTIONS: T;
  PATCH: T;
  POST: T;
  PUT: T;
  [method: `${Uppercase<string>}`]: T;
};

/**
 * A common HTTP method name
 */
export type HttpMethod = keyof MethodRecord<unknown>;
