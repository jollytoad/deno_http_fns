# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Split `@http/fns` into separate packages.
- [@http/generate/generate-routes-module] `httpModulePrefix` replaces `httpFns`
  and `jsr` options, defaulting to `@http/`.
- [@http/interceptor/cors] `cors()` now returns an `Interceptors` objects for
  direct use with `intercept()` or `init()`.

### Added

- [@http/response] `setHeaders()`, `headerEntries()` to accompany
  `appendHeaders()`
- [@http/request] `memoize()`

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
