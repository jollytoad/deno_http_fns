# Agents.md

## Quick start

```sh
deno task ok          # fmt → lint → packages → check → test → publish --dry-run
deno task test        # deno test -A --coverage --no-check
deno task check       # deno check **/*.ts
deno task example <f> # deno run -A --watch <f>
```

## Workspace

- **Deno workspace monorepo** — 13 packages under `packages/`
- Root `deno.json` has workspace list + import map pointing to JSR
  (`jsr:@http/*`)
- `deno task packages` auto-generates each package's `deno.json` exports + root
  `workspace` + imports — run after adding/renaming source files

## Module conventions

- One function per module, no `mod.ts` or `deps.ts`
- Underscore filenames → hyphenated export keys (e.g. `by_method.ts` →
  `./by-method`)
- Imports use relative `.ts` paths for local, `@http/` scope for cross-package
- `import type` required (`verbatimModuleSyntax` + `erasableSyntaxOnly` in
  compilerOptions)
- Internal/private files prefixed with `_`
- Export style: higher-order functions returning
  `(Request, ...args) => Awaitable<Response | null>`
- JSDoc with `@param`, `@returns`, `@example` on all public functions

## Testing

- `Deno.test()` with `@std/assert`, co-located `*.test.ts` files
- Test command uses `--no-check` (typecheck is separate, in `deno task check`)
- Test snapshot dir: `packages/generate/__snapshots__/`
- **Failing tests first**: for any behavioral fix, write the regression tests
  first, run them, and confirm each fails for the expected reason (assertion
  mismatch on the behavior, never a compile/import error) before implementing
  the fix; then re-run for green
- Assertions from `@std/assert`: `assertEquals`, `assertStrictEquals`,
  `assertInstanceOf`, etc.

## CI pipeline

`deno fmt --check` → `deno lint` → `deno task check` → `deno task test` →
`cov:gen` → `deno publish --dry-run`

## Quirks & gotchas

- `deno.lock` is gitignored — intentionally not committed
- Generated files excluded from fmt: `packages/examples/_routes.ts`,
  `packages/generate/_test/*.ts`
- Publish excludes `_test/`, `*.test.ts`, `_test_deps.ts`, `__snapshots__/` in
  each package
- VS Code: Deno extension, test codelens uses `--allow-all --no-check`, 2-space
  indent
- Cross-runtime: packages may target Deno + Bun + Cloudflare Workers (check
  imports for platform-specific APIs)
- `_experimental/` dir (not part of workspace) has prototype modules
- `_tools/fix-imports.ts` replaces underscores with hyphens in `@http/*` import
  paths
