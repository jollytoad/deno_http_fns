import { getImports } from "./_internal.ts";
import type { Code, Import } from "./types.ts";

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
