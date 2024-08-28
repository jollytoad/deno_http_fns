import type { Import } from "./types.ts";

export function hasImports(value: unknown): value is { imports: Import[] } {
  return !!value && typeof value === "object" && "imports" in value &&
    Array.isArray(value.imports);
}

export function isImport(value: unknown): value is Import {
  return !!value && typeof value === "object" && "moduleSpecifier" in value;
}

export function getImports(value: unknown): Import[] {
  return hasImports(value) ? value.imports : isImport(value) ? [value] : [];
}

export function isAsync(...values: unknown[]): boolean {
  return values.some((value) => (
    !!value && typeof value === "object" && "async" in value &&
    value.async === true
  ));
}

export function serialize(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(serialize).join(", ");
  } else if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else {
    return value.toString();
  }
}
