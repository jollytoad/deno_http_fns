import {
  asFn,
  type Code,
  getImports,
  type Import,
  importNamed,
  literal,
} from "./code-builder/mod.ts";
import type { GenerateOptions } from "./types.ts";
import { asTreePaths } from "@http/route/path-tree/as-tree-paths";
import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";
import { generateRouteHandlersCode } from "./_generate_route_handlers_code.ts";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";

/**
 * Generate a route handler of static pre-built routes using
 * code generators prior to runtime.
 */
export default async function generateTreeHandlerCode(
  opts: GenerateOptions,
): Promise<Code> {
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

  const routesCode = await generateRouteHandlersCode(opts);

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
