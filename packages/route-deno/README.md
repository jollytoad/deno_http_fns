# HTTP Routing functions (Deno specific)

See [@http/route](https://jsr.io/@http/route) for platform agnostic functions.

This package provides static file routing for Deno that works neatly with other
`@http` functions. It's based upon the
[Standard library file server](https://jsr.io/@std/http/doc/file-server/~).

## Example

```ts
import { staticRoute } from "@http/route-deno/static-route";
import { withFallback } from "@http/route/with-fallback";

Deno.serve(
  withFallback(
    staticRoute("/", import.meta.resolve("./public")),
  ),
);
```

See [full example](https://jsr.io/@http/examples/doc/static-route/~).
