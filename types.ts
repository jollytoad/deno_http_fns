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
 * An interceptor may return no value (void) or undefined to indicate no change.
 */
export type PassThru = void | undefined;

/**
 * A RequestInterceptor function takes a Request and optionally returns a modified or new Request.
 */
export type RequestInterceptor<in A extends Args = Args> = CustomHandler<
  A,
  Request | PassThru
>;

/**
 * A ResponseInterceptor function takes a Request and Response and optionally returns a modified or
 * new Response, or a skipped response (if R permits).
 */
export type ResponseInterceptor<in out R = Response | Skip> = CustomHandler<
  [response: R],
  R | void
>;

/**
 * An ErrorInterceptor function takes a Request, Response, and error and optionally returns a modified or
 * new Response, or a skipped response (if R permits).
 */
export type ErrorInterceptor<in out R = Response | Skip> = (
  request: Request,
  response: R,
  error: unknown,
) => Response | PassThru;

/**
 * Declare a set of interceptors, for use with the `intercept` function.
 */
export interface Interceptors<
  in A extends Args = Args,
  in out R = Response | Skip,
> {
  /**
   * A chain of RequestInterceptor functions that may return a modified or new Request that is passed to the handler
   */
  request?: readonly RequestInterceptor<A>[];
  /**
   * A chain of ResponseInterceptor functions that may modify the Response from the handler
   */
  response?: readonly ResponseInterceptor<R>[];
  /**
   * A chain of ErrorInterceptor functions that may modify the Response from the handler
   */
  error?: readonly ErrorInterceptor<R>[];
}
