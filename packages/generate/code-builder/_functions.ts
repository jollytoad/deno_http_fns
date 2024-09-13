import { getImports } from "./_internal.ts";
import type { Code, Import } from "./types.ts";

/**
 * Wrap an imported function in a function that generates code for
 * a call to that function.
 *
 * @example
 * ```ts
 * const handleStuff = asFn(importNamed(
 *   "@scope/stuff",
 *   "handleStuff",
 * ));
 *
 * const code = handleStuff("foo");
 * ```
 *
 * @param imp the import of the function
 * @param params the params of the function call
 * @returns a code generating function
 */
export const asFn =
  <P extends unknown[]>(imp: Import) => (...params: P): Code => ({
    imports: [...imp.imports, ...params.flatMap(getImports)],
    hasAwaits() {
      return hasAwaits(...this.imports, ...params);
    },
    returnsPromise() {
      return returnsPromise(...this.imports, ...params);
    },
    toString() {
      return `${imp}(${params.map((v) => v?.toString()).join(", ")})`;
    },
  });

function hasAwaits(...values: unknown[]): boolean {
  return values.some((value) => (
    !!value && typeof value === "object" && "hasAwaits" in value &&
    typeof value.hasAwaits === "function" && value.hasAwaits()
  ));
}

function returnsPromise(...values: unknown[]): boolean {
  return values.some((value) => (
    !!value && typeof value === "object" && "returnsPromise" in value &&
    typeof value.returnsPromise === "function" && value.returnsPromise()
  ));
}
