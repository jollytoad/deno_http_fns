# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0]

### Added

- Support for modules that export http method functions rather than a default
  handler, when generating a routes module.
- `lazy` supports module transformation after loading (to allow dynamic loading
  of http method modules).

### Fixed

- `generate_routes.ts` example to enable `jsr` imports.
