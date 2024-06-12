# Filesystem based route discovery

Many frameworks provide some form of filesystem based routing (Next.js, Fresh,
etc), but they all have their own opinions, and bake the mechanism deep into the
framework.

This package provides the utility to discover routes within the filesystem,
allowing you to build your own filesystem based router using whatever
conventions you want.

It supports custom mapping of path syntax and mapping of request handlers.

## Example

An example of dynamically discovering routes using
[discoverRoutes](https://jsr.io/@http/discovery/doc/discover-routes/~/discoverRoutes)
and building a router and server at runtime using
[@http/route](https://jsr.io/@http/route) functions...

```ts
import { discoverRoutes } from "@http/discovery/discover-routes";
import freshPathMapper from "@http/discovery/fresh-path-mapper";
import { asSerializablePattern } from "@http/discovery/as-serializable-pattern";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { handle } from "@http/route/handle";
import { port } from "@http/host-deno-local/port";

const routes = await discoverRoutes({
  pattern: "/",
  fileRootUrl: import.meta.resolve("./routes"),
  pathMapper: freshPathMapper,
  verbose: true,
});

const handlers = [];

for (const { pattern, module } of routes) {
  // Dynamically import the route module
  const routeModule = await import(module.toString());

  if (routeModule.default) {
    // For this example we'll assume that a default export is the request handler
    handlers.push(byPattern(pattern, routeModule.default));
  } else {
    // For this example we'll assume that a module without a default export instead
    // exports individual method handling functions (eg. GET, POST)
    handlers.push(byPattern(pattern, byMethod(routeModule)));
  }
}

Deno.serve(handle(handlers));
```

This example assumes the convention that a route module either exports a request
handler function as its default export, or it exports a set of individual method
handler functions (eg. GET, POST, PUT).

It makes use of a
[path mapper](https://jsr.io/@http/discovery/doc/fresh-path-mapper/~/freshPathMapper)
that emulates the [Fresh syntax](https://fresh.deno.dev/docs/concepts/routing),
ie. `[name]`, `[[name]]`, `[...path]`, and `(group)`.

You can find the full working example of this in
[@http/examples/discover-routes](https://jsr.io/@http/examples/doc/discover-routes/~).

## A more opinionated dynamic router

If you are happy with the convention above, of each module exporting either a
default handler or method handlers then you can just use the much simpler
[dynamicRoute](https://jsr.io/@http/discovery/doc/dynamic-route/~/dynamicRoute)
function instead...

```ts
import { withFallback } from "@http/route/with-fallback";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import freshPathMapper from "@http/discovery/fresh-path-mapper";

Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
));
```

You can find the full working example of this in
[@http/examples/dynamic-route](https://jsr.io/@http/examples/doc/dynamic-route/~).

## Generate a routes module

All the examples above generate the router dynamically at runtime, this is great
to get started, and for flexibility, but for ultimate efficiency and also for
stronger static type checking we can make use of the `discoverRoutes` to
generate a static routes TypeScript module instead.

This is the subject of [@http/generate](https://jsr.io/@http/generate).
