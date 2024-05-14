# Filesystem based routing

## Route discovery

`discoverRoutes(options) => Promise<DiscoveredRoute[]>`

[Module](../packages/discovery/discover_routes.ts) |
[Example](../packages/examples/scripts/discover_routes.ts)

Walk the filesystem discovering potential routes and handler modules.

## Router module generation

`generateRoutesModule(options) => Promise<boolean>`

[Module](../packages/generate/generate_routes_module.ts) |
[Example script](../packages/examples/scripts/generate_routes.ts) |
[Example of generated routes](../packages/examples/_routes.ts) |
[Example router](../packages/examples/generated_routes.ts)

Generate a TypeScript module that exports a routing handler of discovered
modules, using `byPattern`.

## Dynamic runtime router

`dynamicRoute(options) => Handler`

[Module](../packages/discovery/dynamic_route.ts) |
[Example](../packages/examples/dynamic_route.ts)

A handler that performs route discovery dynamically at runtime.
