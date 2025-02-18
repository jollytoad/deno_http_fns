# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

This changelog will need to be split between individual packages

## [0.26.0]

### Added

- [@http/route] new `byPathTree` function that perform preliminary routing by a
  path segment tree
- [@http/route/path-tree] modules to support `byPathTree`
- [@http/generate] new `routerGenerator` option to allow customised routes
  module generation,
- [@http/generate] `flat-router-generator`, the default router generator, that
  implements the existing router behaviour of `cascade`/`byPattern`
- [@http/generate] `tree-router-generator`, a new router generator, that uses
  the new `byPathTree` instead
- [@http/generate] benchmarks for different styles of generated routers

## [0.25.0]

### Changed

- Update to Deno 2.1.3
- Update to latest `@std` deps
- [@http/route] allow `asURLPattern` to accept a full URL pattern string, by
  attempting to parse the pattern directly with `new URLPattern` before falling
  back to treating it as `pathname` of a `URLPatternInit`
- [@http/route] allow `byPattern`, `bySubPattern`, `cascade` and `lazy` handlers
  to return something other than a `Response` if desired

### Fixed

- [@http/discovery] remove use of `@std/url` in tests
- [@http/host-deno-local], [@http/host-deno-deploy] fix `Deno.serve` related
  types
- [@http/response] allow `prependDocType` to accept `Iterable<Uint8Array>` which
  is now a valid type of `BodyInit`
- fix caught error types to be explicitly `unknown`

## [0.24.0]

### Added

- [@http/interceptor] new RequestInterceptor `applyForwardedHeaders` to apply
  `x-forwarded-*` to the Request URL

### Removed

- [@http/route-deno] package removed

## [0.23.1]

### Fixed

- [@http/generate] prevent `import.meta.resolve()` from being converted to an
  `await import()`

## [0.23.0]

### Changed

- [@http/generate] BREAKING: remove dependency on ts-poet, new code-builder api,
  simplified handler generators, they must use new code-builder api

## [0.22.0]

### Added

- [@http/host-bun-local] new package for Bun localhost dev
- [@http/host-cloudflare-worker] new package to support Cloudflare Workers/Pages

## [0.21.1]

### Changed

- [@http/fs] remove dependency on `npm:bun-types`

## [0.21.0]

### Changed

- Update to Deno 1.45 `workspace`
- Update to latest `@std` deps

## [0.20.0]

### Changed

- [@http/route] introduced a cross-runtime `staticRoute()`
- [@http/route-deno] is now deprecated

### Added

- [@http/fs] new package for filesystem based functions
- [@http/fs] added `fileBody()` as a cross-runtime way to turn a file into a
  Response body
- [@http/fs] added `serveDir()`/`serveFile()`, adapted from
  `@std/http/file-server`
- [@http/response] add responses required by `serveDir`/`serveFile`

## [0.19.0]

### Changed

- [@http/interceptor] rethrow an error if a valid Response is not available to
  return after all error interceptors have been called
- [@http/assert] strip `assert-` from sub-modules (to align with `@std/assert`)
- Update deps to latest v1.* pre-releases of `@std` lib

## [0.18.1]

### Fixed

- [@http/generate] `moduleImports` defaults to `dynamic`

## [0.18.0]

### Added

- [@http/discovery/dynamic-route] support for custom route module -> request
  handler mapping (ie. allow more than just default handler & method handlers)
- [@http/generate] support for custom code generation of route module -> request
  handler mapping, compliments the feature in `dynamicRoute`

### Changed

- [@http/discovery] & [@http/generate] the `fileRootUrl` option is now required,
  it would previous default to `Deno.cwd()` if not provided, but this was
  undocumented and complicates cross-runtime support, this also means the
  `discoverRoutes` requires the options arg too, which was previously optional

## [0.17.0]

### Added

- [@http/generate] support writing of module using Node.js API or into custom
  storage via `writeModule` option
- [@http/discovery] & [@http/generate] allow a `RouteMapper` to stop any further
  route mapping

## [0.16.0]

### Changed

- [@http/interceptor/logger] move response logging into `finally` interceptor so
  that it groups and accounts for timing of streamed responses
- [@http/discovery] default options functions are now dynamically imported when
  required

### Removed

- [@http/discovery] `defaultPathMapper()`, `defaultRouteMapper()`,
  `defaultPathCompare()` removed from module (moved into separate modules and
  renamed)

### Added

- [@http/discovery] `indexPathMapper()`, `tsRouteMapper()`,
  `pathnameLexicalRouteComparator()` added into own modules (replace the old
  default functions)
- [@http/discovery] `combinedRouteMapper()` added to create a single combined
  `RouteMapper` from several
- [@http/discovery/discover-routes] allow custom `readDir` function, support
  both `Deno.readDir` and Node's `opendir` by default
- [@http/generate] supports multiple `RouteMapper`s in `routeMapper` option

## [0.15.1]

### Documentation

- Moved @module jsdocs to top of file

## [0.15.0]

### Fixed

- [@http/discovery/fresh-path-mapper] replace all `[name]` and `[[name]]` groups
  within a path segment rather than having just a single group match the whole
  segment

### Changed

- [@http/interceptor/cors] `corsResponse()` renamed to `addCorsHeaders()`
- Lots more documentation

## [0.14.0]

### Changed

- [@http/interceptor] `byStatus()` renamed to `whenStatus()`

## [0.13.0]

### Added

- [@http/route] `lazy()` moved into here from `@http/handler`

### Removed

- [@http/handler] package removed, `mapData()` was no longer used, and
  `Awaitable` type copied into `types` module of individual packages where
  required

### Fixed

- [@http/example] use a random port if 8000 is not available, and fix tests to
  use this port

## [0.12.0]

### Changed

- [@http/interceptor] `intercept()` error handlers applied at each lifecycle
  stage, and no longer implicitly handles thrown Responses
- [@http/interceptor] `interceptResponse()` moved into own module
- [@http/interceptor] `skip()` moved into own module
- [@http/request] utility functions now take a Request as first parameter rather
  than returning a function

### Added

- [@http/interceptor] `catchResponse()` to explicitly handle thrown Responses
- [@http/interceptor] tests added
- [@http/request] `despose()` added to `memoize` module
- [@http/assert] `assertHeader()` now supports `Request` and `Headers` object

## [0.10.0]

### Changed

- Split `@http/fns` into separate packages.
- [@http/generate/generate-routes-module] `httpModulePrefix` replaces `httpFns`
  and `jsr` options, defaulting to `@http/`.
- [@http/interceptor/cors] `cors()` now returns an `Interceptors` objects for
  direct use with `intercept()` or `init()`.
- [@http/generate] use [ts-poet](https://github.com/stephenh/ts-poet) to
  generate code.

### Added

- [@http/response] `setHeaders()`, `headerEntries()` to accompany
  `appendHeaders()`
- [@http/request] `memoize()`
- [@http/assert] new package of assertions for use in server tests.

### Fixed

- [@http/discovery] updated `freshPathMapper` to support latest Fresh route
  syntax

## [0.7.0]

### Added

- Support for modules that export http method functions rather than a default
  handler, when generating a routes module.
- `lazy` supports module transformation after loading (to allow dynamic loading
  of http method modules).

### Fixed

- `generate_routes.ts` example to enable `jsr` imports.
