# Filesystem functions for HTTP servers

Cross-runtime functions for interacting with the Filesystem from a HTTP server.

This package doesn't aim to cover all possible filesystem operations or file
data, just enough to aid in sending files to/from a HTTP server.

## `fileBody()`

Is a cross-runtime function to construct the body for a Response from a file
given its path and optionally start/end offsets. The actual return value of this
is a `BodyInit` type, ie. something suitable for passing into a `Response`. The
actual object may vary depending on the runtime.

## `serveDir()` & `serveFile()`

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
