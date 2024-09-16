import type { Import } from "./types.ts";

/**
 * Create an import of all the exported members of a module as a
 * single local name
 */
export function importAll(
  moduleSpecifier: string | URL,
  importedBinding: string,
): Import {
  return importSelf({
    moduleSpecifier: moduleSpecifier.toString(),
    importedBinding,
    moduleExportName: "*",
    toString() {
      return this.importedBinding!;
    },
  });
}

/**
 * Create a import of the default export of a module with a local name
 */
export function importDefault(
  moduleSpecifier: string | URL,
  importedBinding: string,
): Import {
  return importSelf({
    moduleSpecifier: moduleSpecifier.toString(),
    importedBinding,
    moduleExportName: "default",
    toString() {
      return this.importedBinding!;
    },
  });
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
  return importSelf({
    moduleSpecifier: moduleSpecifier.toString(),
    moduleExportName,
    importedBinding,
    toString() {
      return this.importedBinding!;
    },
  });
}

/**
 * Create an `import.meta.resolve()` call.
 */
export function importResolve(
  moduleSpecifier: string | URL,
): Import {
  return importSelf({
    moduleSpecifier: moduleSpecifier.toString(),
    inline: true,
    toString() {
      return `import.meta.resolve(${JSON.stringify(this.moduleSpecifier)})`;
    },
  });
}

/**
 * Convert an import to an inline dynamic import
 */
export function dynamicImport(imp: Import): Import {
  if (imp.inline !== undefined) return imp;

  return Object.assign<Import, Partial<Import>>(
    imp,
    {
      inline: true,
      hasAwaits: () => true,
      returnsPromise: () => true,
      toString() {
        if (this.moduleExportName && this.moduleExportName !== "*") {
          return `(await import(${
            JSON.stringify(this.moduleSpecifier)
          })).${this.moduleExportName}`;
        } else {
          return `await import(${JSON.stringify(this.moduleSpecifier)})`;
        }
      },
    },
  );
}

/**
 * Ensure an import remains static
 */
export function staticImport(imp: Import): Import {
  imp.inline = false;
  return imp;
}

function importSelf(
  imp: Omit<Import, "imports"> & Partial<Pick<Import, "imports">>,
): Import {
  imp.imports ??= [imp as Import];
  return imp as Import;
}
