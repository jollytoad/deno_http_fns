import type { Code, Import } from "./types.ts";

/**
 * Create an inline dynamic import of a single named module member.
 */
export function awaitImportNamed(
  moduleSpecifier: string | URL,
  moduleExportName: string,
): Code {
  const imp: Import = {
    moduleSpecifier: moduleSpecifier.toString(),
    inline: true,
    moduleExportName,
  };
  return {
    imports: [imp],
    async: true,
    toString() {
      return `(await import(${
        JSON.stringify(imp.moduleSpecifier)
      })).${imp.moduleExportName}`;
    },
  };
}

/**
 * Create an inline dynamic import of a module, not awaited.
 */
export function dynamicImportAll(
  moduleSpecifier: string | URL,
): Code {
  return inlineImportAll(moduleSpecifier, false);
}

/**
 * Create an inline dynamic awaited import of a module.
 */
export function awaitImportAll(
  moduleSpecifier: string | URL,
): Code {
  return inlineImportAll(moduleSpecifier, true);
}

/**
 * Create an `import.meta.resolve()` call.
 */
export function importResolve(
  moduleSpecifier: string | URL,
): Code {
  const imp: Import = {
    moduleSpecifier: moduleSpecifier.toString(),
    inline: true,
  };
  return {
    imports: [imp],
    toString() {
      return `import.meta.resolve(${JSON.stringify(imp.moduleSpecifier)})`;
    },
  };
}

function inlineImportAll(
  moduleSpecifier: string | URL,
  awaitPrefix: boolean,
): Code {
  const imp: Import = {
    moduleSpecifier: moduleSpecifier.toString(),
    inline: true,
  };
  return {
    imports: [imp],
    async: awaitPrefix,
    toString() {
      return (awaitPrefix ? "await " : "") +
        `import(${JSON.stringify(imp.moduleSpecifier)})`;
    },
  };
}
