// deno-lint-ignore-file require-await
import { handle } from "@http/fns/handle.ts";
import { byPattern } from "@http/fns/by_pattern.ts";
import { lazy } from "@http/fns/lazy.ts";
import { ok } from "@http/fns/response/ok.ts";

export default Deno.serve(handle([
  // `lazy` accepts an async function that loads the handler module (with default function)
  // on first request
  byPattern("/test-import", lazy(() => import("./_lazy_handler.ts"))),

  // or a string or URL of the handler module
  // NOTE: you'd generally use the `() => import("...")` pattern above rather than this though,
  // so that static analysis of compile/deploy can ensure the dynamic module is bundled in.
  byPattern("/test-resolve", lazy(import.meta.resolve("./_lazy_handler.ts"))),

  // or an async function that returns the handler function
  byPattern(
    "/test-async",
    lazy(async () => (_req: Request) => ok(`Lazy async handler`)),
  ),

  // or a sync function that returns the handler function
  byPattern(
    "/test-sync",
    lazy(() => (_req: Request) => ok(`Lazy sync handler`)),
  ),
]));
