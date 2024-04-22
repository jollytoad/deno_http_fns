import { Import } from "ts-poet";

export { type Code, code, joinCode, literalOf } from "ts-poet";

export function importAll(moduleSpec: string | URL, importedName: string) {
  return Import.importsAll(importedName, moduleSpec.toString());
}

export function importDefault(moduleSpec: string | URL, importedName: string) {
  return Import.importsDefault(importedName, moduleSpec.toString());
}

export function importNamed(
  moduleSpec: string | URL,
  exportedName: string,
  importedName?: string,
) {
  return Import.importsName(
    exportedName,
    moduleSpec.toString(),
    false,
    importedName,
  );
}
