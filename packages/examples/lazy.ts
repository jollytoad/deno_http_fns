/**
 * This is an example of using {@linkcode lazy} to dynamically
 * import request handlers only when they are first required.
 *
 * You can run the example directly from JSR with:
 *
 * ```sh
 * deno run --allow-net jsr:@http/examples/lazy
 * ```
 *
 * And try hitting the following URLs in your browser:
 *
 * - http://localhost:8000/test-import
 * - http://localhost:8000/test-resolve
 * - http://localhost:8000/test-async
 * - http://localhost:8000/test-sync
 *
 * @module
 */

// deno-lint-ignore-file require-await

import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { lazy } from "@http/route/lazy";
import { ok } from "@http/response/ok";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  handle([
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
  ]),
) as Deno.HttpServer;

export default server;
