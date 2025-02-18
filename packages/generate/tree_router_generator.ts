import {
  asFn,
  type Code,
  getImports,
  type Import,
  importNamed,
  literal,
} from "./code-builder/mod.ts";
import type { GeneratorOptions } from "./types.ts";
import { asTreePaths } from "@http/route/path-tree/as-tree-paths";
import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import type { DiscoveredRoute } from "@http/discovery/types";

/**
 * Generate a tree router that builds a rough tree of the path segments and uses
 * `byPathTree` to narrow the down the number of handlers that need to be
 * called. Routes that require any kind of wild card matching still use
 * `byPattern` to perform the final match.
 */
export function generate(
  routesCode: Map<DiscoveredRoute, Code[]>,
  opts: GeneratorOptions,
): Code {
  const {
    httpModulePrefix = "@http/",
  } = opts;

  const byPathTree = asFn(importNamed(
    `${httpModulePrefix}route/by-path-tree`,
    "byPathTree",
  ));

  const byPattern = asFn(importNamed(
    `${httpModulePrefix}route/by-pattern`,
    "byPattern",
  ));

  const symbols = {
    [WILD]: importSymbol("WILD"),
    [LEAF]: importSymbol("LEAF"),
    [GUARD]: importSymbol("GUARD"),
  };

  const treeCode: PathTreeCode = {};

  for (const [route, codes] of routesCode) {
    const treePaths = asTreePaths(route.pattern);
    const codePattern = literal(asSerializablePattern(route.pattern));

    for (const path of treePaths) {
      let hasWild = false;
      let branch = treeCode;
      for (const segment of path) {
        if (segment === WILD || segment === GUARD) {
          hasWild = true;
        }
        if (typeof segment === "string" || segment === WILD) {
          branch = branch[segment] ??= {};
        } else {
          const handlers = branch[segment] ??= [];

          if (hasWild) {
            handlers.push(...codes.map((code) => byPattern(codePattern, code)));
          } else {
            handlers.push(...codes);
          }
          break;
        }
      }
    }
  }

  return byPathTree(literalTree(treeCode));

  function literalTree(tree: PathTreeCode): Code {
    const imports: Import[] = [];
    const tokens: unknown[] = [];

    function symbolKey(symbol: Import) {
      imports.push(symbol);
      tokens.push("[");
      tokens.push(symbol);
      tokens.push("]");
      tokens.push(":");
    }

    function handlers(routeCode: Code[]) {
      tokens.push("[");
      routeCode.forEach((code) => {
        imports.push(...getImports(code));
        tokens.push(code);
        tokens.push(",");
      });
      tokens.push("]");
    }

    function walk(branch: PathTreeCode) {
      tokens.push("{");
      if (branch[GUARD]?.length) {
        symbolKey(symbols[GUARD]);
        handlers(branch[GUARD]);
      }
      if (branch[LEAF]?.length) {
        symbolKey(symbols[LEAF]);
        handlers(branch[LEAF]);
      }
      Object.entries(branch).forEach(([key, val]) => {
        tokens.push(JSON.stringify(key));
        tokens.push(":");
        walk(val);
        tokens.push(",");
      });
      if (branch[WILD]) {
        symbolKey(symbols[WILD]);
        walk(branch[WILD]);
      }
      tokens.push("}");
    }

    walk(tree);

    return {
      imports,
      toString: () => tokens.map((v) => v?.toString()).join(" "),
    };
  }

  function importSymbol(name: string): Import {
    return importNamed(
      `${httpModulePrefix}route/path-tree/symbols`,
      name,
    );
  }
}

interface PathTreeCode {
  [LEAF]?: Code[];
  [GUARD]?: Code[];
  [WILD]?: PathTreeCode;
  [segment: string]: PathTreeCode;
}
