# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

This changelog will need to be split between individual packages

- [@http/discovery] moved default path/route mapper and comparators into own
  modules, which are now dynamically imported only when required
- [@http/discovery/discover-routes] allow custom `readDir` function, support
  both `Deno.readDir` and Node's `opendir` by default

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
