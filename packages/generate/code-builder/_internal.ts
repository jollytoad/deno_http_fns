import type { Import } from "./types.ts";

function hasImports(value: unknown): value is { imports: Import[] } {
  return !!value && typeof value === "object" && "imports" in value &&
    Array.isArray(value.imports);
}

export function getImports(value: unknown): Import[] {
  return hasImports(value) ? value.imports : [];
}
