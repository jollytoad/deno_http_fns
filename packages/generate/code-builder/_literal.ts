import { getImports } from "./_internal.ts";
import type { Code, Import } from "./types.ts";

/**
 * Represent a literal code value.
 */
export function literal(value: unknown): Code {
  const imports: Import[] = [];
  const tokens: unknown[] = [];

  function walk(o: unknown) {
    imports.push(...getImports(o));
    if (o === undefined) {
      tokens.push("undefined");
    } else if (Array.isArray(o)) {
      tokens.push("[");
      o.forEach((v) => {
        walk(v);
        tokens.push(",");
      });
      tokens.push("]");
    } else if (o && Object.hasOwn(o, "toString")) {
      tokens.push(o);
    } else if (o && typeof o === "object") {
      tokens.push("{");
      Object.entries(o).forEach(([key, val]) => {
        if (val !== undefined) {
          tokens.push(JSON.stringify(key));
          tokens.push(":");
          walk(val);
          tokens.push(",");
        }
      });
      tokens.push("}");
    } else {
      tokens.push(JSON.stringify(o));
    }
  }

  walk(value);

  return {
    imports,
    toString: () => tokens.map((v) => v?.toString()).join(" "),
  };
}
