import type { RoutePattern, SingleRoutePattern } from "./types.ts";

/**
 * Convert a single RoutePattern to a URLPattern.
 */
export function asURLPattern(
  pattern: SingleRoutePattern,
): URLPattern {
  return typeof pattern === "string"
    ? stringAsURLPattern(pattern)
    : pattern instanceof URLPattern
    ? pattern
    : new URLPattern(pattern);
}

function stringAsURLPattern(pattern: string) {
  try {
    return new URLPattern(pattern);
  } catch {
    return new URLPattern({ pathname: pattern });
  }
}

/**
 * Convert a RoutePattern (one or many patterns) to an array of URLPattern.
 */
export function asURLPatterns(
  pattern: RoutePattern,
): URLPattern[] {
  return Array.isArray(pattern)
    ? pattern.map(asURLPattern)
    : [asURLPattern(pattern)];
}
