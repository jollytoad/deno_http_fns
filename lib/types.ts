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

type MethodRecord<T> = {
  DELETE: T;
  GET: T;
  HEAD: T;
  OPTIONS: T;
  PATCH: T;
  POST: T;
  PUT: T;
  [method: string]: T;
};

export type HttpMethod = keyof MethodRecord<unknown>;

/**
 * A RequestInterceptor function takes a Request and optionally returns a modified or new Request.
 *
 * May return no value (void) or undefined to indicate no change to the Request.
 *
 * May also return (or throw) a Response to skip further RequestInterceptors and the handler entirely,
 * the response will still be passed through further ResponseInterceptors.
 */
export type RequestInterceptor<in A extends unknown[] = unknown[]> = (
  req: Request,
  ...args: A
) => Awaitable<Request | Response | void>;

/**
 * A ResponseInterceptor function takes a Request and Response and optionally returns a modified or
 * new Response, or null to indicate a skipped response (if R permits).
 *
 * May also return no value (void) or undefined to indicate no change to the Response.
 */
export type ResponseInterceptor<in out R = Response | null> = (
  req: Request,
  res: R,
) => Awaitable<R | void>;

/**
 * An ErrorInterceptor function takes a Request, Response, and error and optionally returns a modified or
 * new Response, or null to indicate a skipped response (if R permits).
 */
export type ErrorInterceptor<in out R = Response | null> = (
  req: Request,
  res: R,
  error: unknown,
) => R | void;

/**
 * Declare a set of interceptors, for use with the `intercept` function.
 */
export interface Interceptors<
  in A extends unknown[] = unknown[],
  in out R = Response | null,
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
