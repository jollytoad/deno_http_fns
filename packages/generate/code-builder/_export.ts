import type { Code } from "./types.ts";

export function exportDefault(code: Code): Code {
  return {
    imports: code.imports,
    toString() {
      return `export default ${code};`;
    },
  };
}
