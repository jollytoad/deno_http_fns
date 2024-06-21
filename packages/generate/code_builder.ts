/**
 * This is a library of functions to help build code generators for use with `generateRoutesModule`.
 *
 * It's built upon a restricted set of [ts-poet](https://github.com/stephenh/ts-poet) functions.
 *
 * To ensure future compatibility you should only use the functions exported from here
 * within the code generators and not anything directly from `ts-poet`.
 *
 * @module
 */

import { type Code, code, Import, joinCode, literalOf } from "ts-poet";
import type { RoutePattern } from "@http/discovery/types";
import {
  asSerializablePattern,
  type SerializableRoutePattern,
} from "@http/discovery/as-serializable-pattern";
import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";

export { type Code, code, type Import, joinCode, literalOf };

/**
 * Create an import of all the exported members of a module as a
 * single local name
 *
 * @param moduleSpec The module spec to import from
 * @param localName The local name of the imported members
 */
export function importAll(
  moduleSpec: string | URL,
  importedName: string,
): Import {
  return Import.importsAll(importedName, moduleSpec.toString());
}

/**
 * Create a import of the default export of a module with a local name
 *
 * @param moduleSpec The module spec to import from
 * @param importedName The local name for the imported default member
 */
export function importDefault(
  moduleSpec: string | URL,
  importedName: string,
): Import {
  return Import.importsDefault(importedName, moduleSpec.toString());
}

/**
 * Create a import of a named exported member of a module, optionally
 * with an alternative local name.
 *
 * @param moduleSpec The module spec to import from
 * @param exportedName The name of member as exported from the module
 * @param importedName The local name for the imported member
 */
export function importNamed(
  moduleSpec: string | URL,
  exportedName: string,
  importedName?: string,
): Import {
  return Import.importsName(
    exportedName,
    moduleSpec.toString(),
    false,
    importedName,
  );
}

/**
 * Convert a {@linkcode RoutePattern} to it's most appropriate code
 * representation.
 *
 * @param pattern The original route pattern
 * @returns A Code chunk or a serializable object suitable for use within
 * a `code` literal template.
 */
export function asCodePattern(
  pattern: RoutePattern,
): SerializableRoutePattern | Code {
  const serializablePattern = asSerializablePattern(pattern);
  if (
    typeof serializablePattern === "string" ||
    Array.isArray(serializablePattern)
  ) {
    return code`${literalOf(serializablePattern)}`;
  } else {
    return serializablePattern;
  }
}

/**
 * Produce a relative module spec for use in a `code` literal template.
 *
 * @param module The target module `file:` URL
 * @param moduleOutUrl The URL of the generated module
 * @returns a relative path from the generated module to the target module
 */
export function relativeModulePath(
  module: string | URL,
  moduleOutUrl: string | URL,
): string {
  const outPath = dirname(fromFileUrl(moduleOutUrl));
  const modulePath = relative(outPath, fromFileUrl(module));
  return modulePath[0] !== "." ? "./" + modulePath : modulePath;
}
