import type { SingleRoutePattern } from "./types.ts";

/**
 * Convert a single RoutePattern to a URLPattern.
 */
export function asURLPattern(
  pattern: SingleRoutePattern,
): URLPattern {
  return typeof pattern === "string"
    ? new URLPattern({ pathname: pattern })
    : pattern instanceof URLPattern
    ? pattern
    : new URLPattern(pattern);
}
