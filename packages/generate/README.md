# Filesystem based router code generation

Many frameworks provide some form of filesystem based routing (Next.js, Fresh,
etc), but they all have their own opinions, and bake the mechanism deep into the
framework.

This package builds upon [@http/discovery](https://jsr.io/@http/discovery), to
turn the discovered routes into a static TypeScript module.

## Example

```ts
import { generateRoutesModule } from "@http/generate/generate-routes-module";

await generateRoutesModule({
  pattern: "/",
  fileRootUrl: import.meta.resolve("./routes"),
  moduleOutUrl: import.meta.resolve("./routes.ts"),
  pathMapper: "@http/discovery/fresh-path-mapper",
  verbose: true,
});
```

This script will discover routes using
[discoverRoutes](https://jsr.io/@http/discovery/doc/discover-routes/~/discoverRoutes),
and generate a static `routes.ts` module, something like this...

```ts
// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/route/by-method";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";
import { lazy } from "@http/route/lazy";

export default cascade(
  byPattern("/user/:name", lazy(() => import("./routes/user/[name].ts"))),
  byPattern(
    "/methods",
    lazy(async () => byMethod(await import("./routes/methods.ts"))),
  ),
  byPattern("/", lazy(() => import("./routes/index.ts"))),
);
```

This can then be used as part of the router for a server:

```ts
import routes from "./routes.ts";
import { withFallback } from "@http/route/with-fallback";

await Deno.serve(withFallback(routes)).finished;
```

or for use with the new `deno serve` command:

```ts
import routes from "./routes.ts";
import { withFallback } from "@http/route/with-fallback";

export default {
  fetch: withFallback(routes),
};
```

I recommend generating the modules at development time and commit to git along
with the rest of your code. You can also trigger generation with your dev
server.

Take a look at the full example for this:

- [Generate routes script](https://jsr.io/@http/examples/doc/scripts/generate-routes/~)
- [Dev server](https://jsr.io/@http/examples/doc/generated-routes/~)

```ts
import generateRoutes from "../scripts/gen.ts";
import init from "@http/host-deno-local/init";

await generateRoutes();

// This allows loading of a new or modified routes.ts module
const handler = lazy(import.meta.resolve("./handler.ts"));

await Deno.serve(await init(handler)).finished;
```
