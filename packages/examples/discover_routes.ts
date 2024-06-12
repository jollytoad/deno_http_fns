import { discoverRoutes } from "@http/discovery/discover-routes";
import freshPathMapper from "@http/discovery/fresh-path-mapper";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { handle } from "@http/route/handle";
import { port } from "@http/host-deno-local/port";

/**
 * This is an example of using {@linkcode discoverRoutes} directly to build a
 * router from handlers in the filesystem.
 *
 * It assumes the convention that a route module either exports a request
 * handler function as its default export, or it exports a set of individual method
 * handler functions (eg. GET, POST, PUT).
 *
 * Although you could assume whatever convention you want with the discovered modules.
 * For example, you could assume the default export was a component, and also check
 * for a function named `handler` (a la Fresh).
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/discover-routes
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000
 * - http://localhost:8000/methods
 * - http://localhost:8000/user/bob
 *
 * @module
 */

console.log("\n%cDiscovering Routes...\n", "color: green; font-weight: bold;");

const routes = await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("./_routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});

console.log("\n%cRegistering Handlers...", "color: green; font-weight: bold;");

const handlers = [];

for (const { pattern, module } of routes) {
  console.log("\nPattern:", asSerializablePattern(pattern));
  console.log("Module:", module.toString());

  const routeModule = await import(module.toString());
  console.debug(routeModule);

  if (routeModule.default) {
    // For this example we'll assume that a default export is the request handler
    console.log(
      "%cRegistering default module export as the route handler",
      "color: violet;",
    );
    handlers.push(byPattern(pattern, routeModule.default));
  } else {
    // For this example we'll assume that a module without a default export instead
    // exports individual method handling functions (eg. GET, POST)
    console.log(
      "%cRegistering exported functions as method handlers for the route",
      "color: pink;",
    );
    handlers.push(byPattern(pattern, byMethod(routeModule)));
  }
}

console.log("\n%cStarting Server...\n", "color: green; font-weight: bold;");

const server = Deno.serve(
  { port: port() },
  handle(handlers),
) as Deno.HttpServer;

export default server;
