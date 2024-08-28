import type { Import } from "./types.ts";

/**
 * Create an import of all the exported members of a module as a
 * single local name
 */
export function importAll(
  moduleSpecifier: string | URL,
  importedBinding: string,
): Import {
  return {
    moduleSpecifier: moduleSpecifier.toString(),
    importedBinding,
    moduleExportName: "*",
    toString() {
      return this.importedBinding!;
    },
  };
}

/**
 * Create a import of the default export of a module with a local name
 */
export function importDefault(
  moduleSpecifier: string | URL,
  importedBinding: string,
): Import {
  return {
    moduleSpecifier: moduleSpecifier.toString(),
    importedBinding,
    moduleExportName: "default",
    toString() {
      return this.importedBinding!;
    },
  };
}

/**
 * Create a import of a named exported member of a module, optionally
 * with an alternative local name.
 */
export function importNamed(
  moduleSpecifier: string | URL,
  moduleExportName: string,
  importedBinding = moduleExportName,
): Import {
  return {
    moduleSpecifier: moduleSpecifier.toString(),
    moduleExportName,
    importedBinding,
    toString() {
      return this.importedBinding!;
    },
  };
}
