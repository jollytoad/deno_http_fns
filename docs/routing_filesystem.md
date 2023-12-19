# Filesystem based routing

## Route discovery

`discoverRoutes(options) => Promise<DiscoveredRoute[]>`

[Module](../lib/discover_routes.ts) |
[Example](../examples/scripts/discover_routes.ts)

Walk the filesystem discovering potential routes and handlers modules.

## Router module generation

`generateRoutesModule(options) => Promise<boolean>`

[Module](../lib/generate_routes_module.ts) |
[Example script](../examples/scripts/generate_routes.ts) |
[Example of generated routes](../examples/routes.ts) |
[Example router](../examples/generated_routes.ts)

Generate a TypeScript module that exports a routing handler of discovered
modules, using `byPattern`.

## Dynamic runtime router

`dynamicRoute(options) => Handler`

[Module](../lib/dynamic_route.ts) | [Example](../examples/dynamic_route.ts)

A handler that performs route discovery dynamically at runtime.
