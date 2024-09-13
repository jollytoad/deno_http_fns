import type { Code, Import, Resolver } from "./types.ts";

export function generateModule(code: Code): string {
  return toImportLines(code).join("\n") + "\n\n" + code.toString();
}

export function resolveImports(
  code: { imports?: Import[] },
  resolver: Resolver,
) {
  code.imports?.forEach((imp) =>
    imp.moduleSpecifier = resolver(imp.moduleSpecifier)
  );
}

export function toImportLines({ imports }: { imports?: Import[] }): string[] {
  if (!imports) {
    return [];
  }

  const lines: string[] = [];

  const importsByExportKind = Object.groupBy(imports, exportKind);

  // importsByExportKind.none?.forEach(i => { lines.push(`import "${i.moduleSpecifier}";`) });
  importsByExportKind.all?.toSorted(byModuleSpecifier).forEach((i) => {
    lines.push(
      `import * as ${i.importedBinding} from "${i.moduleSpecifier}";`,
    );
  });
  importsByExportKind.default?.toSorted(byModuleSpecifier).forEach((i) => {
    lines.push(
      `import ${i.importedBinding} from "${i.moduleSpecifier}";`,
    );
  });

  const importsBySpecifier = Object.groupBy(
    importsByExportKind.named?.toSorted(byModuleSpecifier) ?? [],
    (i) => i.moduleSpecifier,
  );

  Object.entries(importsBySpecifier).map(([moduleSpecifier, imports]) => {
    const importSpecifiers = new Set(
      imports?.map((i) =>
        i.importedBinding !== i.moduleExportName
          ? `${i.moduleExportName} as ${i.importedBinding}`
          : i.importedBinding
      ),
    );
    if (importSpecifiers.size) {
      lines.push(
        `import { ${
          [...importSpecifiers].toSorted().join(", ")
        } } from "${moduleSpecifier}";`,
      );
    }
  });

  return lines;
}

function exportKind(
  imp: Import,
): "all" | "default" | "named" | "none" | "inline" {
  if (imp.inline) return "inline";
  switch (imp.moduleExportName) {
    case "*":
      return "all";
    case "default":
      return "default";
    default:
      return imp.moduleExportName ? "named" : "none";
  }
}

function byModuleSpecifier(a: Import, b: Import) {
  return a.moduleSpecifier.localeCompare(b.moduleSpecifier);
}
