import type {
  DiscoveredRoute,
  RequestHandler,
  RouteModule,
} from "@http/discovery/types";
import type { Code } from "./code-builder/types.ts";
import type { DiscoverRoutesOptions } from "@http/discovery/discover-routes";
import type { Eagerness } from "@http/discovery/dynamic-route";

export type { Code, RequestHandler, RouteModule };

/**
 * A result that may be `await`ed.
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * A function that transforms a route module into a Request handler.
 *
 * May return `undefined` if unable to produce a handler.
 */
export type HandlerCodeGenerator = (
  entry: RouteModule,
  opts: GeneratorOptions,
  i: number,
) => Code | undefined;

/**
 * A module that transforms a route module into a Request handler.
 *
 * May return `undefined` if unable to produce a handler.
 */
export interface HandlerGeneratorModule {
  /**
   * The {@linkcode HandlerMapper} to use when generating a `dynamicRoutes`
   * powered module. (ie. when `routeDiscovery` is not `static`)
   */
  handlerMapper: string | URL;

  /**
   * Code generator, used when `routeDiscovery` is `static`.
   */
  generate: HandlerCodeGenerator;
}

/**
 * Function to generate the code of the combined handler for all
 * discovered routes and their associated generated handlers.
 */
export type RouterCodeGenerator = (
  routes: Map<DiscoveredRoute, Code[]>,
  opts: GeneratorOptions,
) => Awaitable<Code>;

/**
 * A module that contains a RouterCodeGenerator to combine multiple
 * route handlers into a single 'Router' handler.
 */
export interface RouterGeneratorModule {
  /**
   * Code generator, used when `routeDiscovery` is `static`.
   */
  generate: RouterCodeGenerator;
}

/**
 * Options passed to the code generator.
 */
export interface GeneratorOptions {
  /**
   * The absolute path of the module to be generated, as a `file:` URL.
   */
  moduleOutUrl: string | URL;

  /**
   * The prefix for http function modules.
   * Defaults to `@http/`, but you may want to change this to import
   * custom modules, or use `jsr:@http/` if you don't want to add it
   * to your import map.
   */
  httpModulePrefix?: string;

  /**
   * Whether to generate static imports or dynamic imports,
   * this only applies to 'static' route discovery.
   * Defaults to `dynamic`.
   */
  moduleImports?: "static" | "dynamic";
}

/**
 * Options passed to `generateRoutesModule`.
 */
export interface GenerateOptions extends
  GeneratorOptions,
  Omit<
    DiscoverRoutesOptions,
    "pathMapper" | "routeMapper" | "compare" | "consolidate"
  > {
  /**
   * Whether to discover routes at build time and generate a static list or,
   * discover them dynamically at startup, or when the first request is made.
   * Defaults to `static`.
   */
  routeDiscovery?: "static" | "startup" | "request";

  /**
   * Module that supplies a PathMapper as the default function.
   */
  pathMapper?: string | URL;

  /**
   * Module(s) that supply a RouteMapper as the default function.
   */
  routeMapper?: string | URL | Array<string | URL>;

  /**
   * Module(s) that generate the handlers for a route.
   */
  handlerGenerator?:
    | Awaitable<HandlerGeneratorModule>
    | Array<Awaitable<HandlerGeneratorModule>>;

  /**
   * Module that supplies a RouteComparator as the default function.
   */
  compare?: string | URL;

  /**
   * Module to generate the code of the combined handler for all
   * discovered routes and their associated generated handlers.
   *
   * Only applicable when `routeDiscovery` is `static`.
   */
  routerGenerator?: Awaitable<RouterGeneratorModule>;

  /**
   * Function to format the new module.
   *
   * Will not format the module if not supplied.
   */
  formatModule?: (url: string | URL, content: string) => Promise<string>;

  /**
   * Function to write the new module.
   *
   * Will default to use appropriate Deno or Node APIs, but you can
   * supply your own implementation if you want to store the module
   * elsewhere on another platform.
   *
   * It should only write the module if it differs from the existing
   * module, and return true if the different module was saved.
   */
  writeModule?: (url: string | URL, content: string) => Promise<boolean>;
}

/**
 * Options for `generateDynamicRouteHandler`.
 */
export type GenerateDynamicRouteOptions = GenerateOptions & {
  routeDiscovery: Eagerness;
};
