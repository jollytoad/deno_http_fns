import type { Awaitable } from "@http/handler/types";

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
