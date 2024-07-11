# HTTP Routing functions (Deno specific)

See [@http/route](https://jsr.io/@http/route) for platform agnostic functions.

This package provides static file routing for Deno that works neatly with other
`@http` functions. It's based upon the
[Standard library file server](https://jsr.io/@std/http/doc/file-server/~), but
no longer uses it directly.

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

## `serveDir` & `serveFile`

These functions have been copied from `@std/http/file-server` and adapted to fit
better with other `@http` functions, and to provide the basis for `staticRoute`.

They have some features stripped out that were present in
`@std/http/file-server`:

- No directory listing renderer
- No built-in support for Deno Deploy (see `denoDeployEtag()`)
- No CORS support (can use `cors()` interceptor instead)
- No custom headers added to response (can use an interceptor and
  `appendHeaders()` instead)
- No standalone server

## `denoDeployEtag()`

This function can be used to generate a constant ETag based on the
`DENO_DEPLOYMENT_ID` if set, and passed into `etagDefault` of the file server
functions to restore the original behaviour of the `@std/http/file-server`.

```ts
import { staticRoute } from "@http/route-deno/static-route";
import { denoDeployEtag } from "@http/route-deno/deno-deploy-etag";
import { withFallback } from "@http/route/with-fallback";

Deno.serve(
  withFallback(
    staticRoute("/", import.meta.resolve("./public"), {
      etagDefault: denoDeployEtag(),
    }),
  ),
);
```
