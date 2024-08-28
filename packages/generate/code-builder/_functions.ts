import { getImports, isAsync } from "./_internal.ts";
import type { Code, Import } from "./types.ts";

export const asFn =
  <P extends unknown[]>(name: Import | string) => (...params: P): Code => ({
    imports: [...getImports(name), ...params.flatMap(getImports)],
    async: isAsync(...params),
    toString() {
      return `${name}(${params.map((v) => v?.toString()).join(", ")})`;
    },
  });

export function returnFromFn(returnValue: unknown): Code {
  const async = isAsync(returnValue);
  return {
    imports: [...getImports(returnValue)],
    toString() {
      return (async ? "async " : "") + `() => ${returnValue}`;
    },
  };
}
