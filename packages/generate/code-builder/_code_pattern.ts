import type { RoutePattern } from "@http/discovery/types";
import {
  asSerializablePattern,
  type SerializableRoutePattern,
} from "@http/discovery/as-serializable-pattern";
import type { Code } from "./types.ts";
import { literal } from "./_literal.ts";

/**
 * Convert a {@linkcode RoutePattern} to it's most appropriate code
 * representation.
 *
 * @param pattern The original route pattern
 * @returns A Code chunk or a serializable object suitable for use within
 * a `code` literal template.
 */
export function asCodePattern(
  pattern: RoutePattern,
): SerializableRoutePattern | Code {
  return literal(asSerializablePattern(pattern));
}
