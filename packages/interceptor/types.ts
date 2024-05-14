import type { Awaitable } from "@http/handler/types";

/**
 * A function that is called before the handler,
 * takes a Request and optionally returns a modified or new Request, or Response.
 *
 * May return no value (void) or undefined to indicate no change to the Request.
 *
 * If a Response is returned, all further RequestInterceptors and the handler are skipped entirely,
 * the response will still be passed to the ResponseInterceptors.
 *
 * @template A the additional arguments passed to the handler
 */
export type RequestInterceptor<in A extends unknown[] = unknown[]> = (
  req: Request,
  ...args: A
) => Awaitable<Request | Response | void>;

/**
 * A function that is called after the handler and/or RequestInterceptors,
 * takes a Request and Response and optionally returns a modified or
 * new Response, or null to indicate a skipped response (if R permits).
 *
 * May return no value (void) or undefined to indicate no change to the Response.
 *
 * @template R may be set to just Response to indicate that a null is not permitted
 */
export type ResponseInterceptor<in out R = Response | null> = (
  req: Request,
  res: R,
) => Awaitable<R | void>;

/**
 * A function that may handle errors from other interceptors or the main request handler,
 * takes a Request, Response, and error and optionally returns a modified or
 * new Response, or null to indicate a skipped response (if R permits).
 *
 * @template R may be set to just Response to indicate that a null is not permitted
 */
export type ErrorInterceptor<in out R = Response | null> = (
  req: Request,
  res: R | undefined,
  error: unknown,
) => Awaitable<R | void>;

/**
 * A function that is called when an incoming Request lifecycle has completed, which includes
 * being aborted, erroring or when the Request and Response streams are completely drained.
 */
export type FinallyInterceptor = (
  req: Request,
  res: Response | null,
  // deno-lint-ignore no-explicit-any
  reason?: any,
) => Awaitable<void>;

/**
 * The kinds of interceptors for use with the `intercept` function, with their respective function signatures.
 */
export type InterceptorKinds<
  in A extends unknown[] = unknown[],
  in out R = Response | null,
> = {
  request: RequestInterceptor<A>;
  response: ResponseInterceptor<R>;
  error: ErrorInterceptor<R>;
  finally: FinallyInterceptor;
};

/**
 * An interceptor kind name.
 */
export type InterceptorKind = keyof InterceptorKinds;

/**
 * The interceptors configuration passed to `intercept`, zero, one or many (an array) of each kind of interceptor can be declared.
 */
export type Interceptors<
  in A extends unknown[] = unknown[],
  in out R = Response | null,
> = {
  readonly [Kind in keyof InterceptorKinds<A, R>]?:
    | ReadonlyArray<InterceptorKinds<A, R>[Kind]>
    | InterceptorKinds<A, R>[Kind];
};
