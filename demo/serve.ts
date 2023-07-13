import { intercept } from "../intercept.ts";
import { handle } from "../handle.ts";
import { byPattern } from "../pattern.ts";
import { byMethod } from "../method.ts";
import { ok } from "../response.ts";
import { staticRoute } from "../static.ts";
import { logging } from "../logger.ts";

const handlers = [
  byPattern(
    "/foo",
    byMethod({
      GET: () => ok("Foo"),
    }),
  ),
  staticRoute("/public", import.meta.resolve("./public"), { quiet: false }),
];

Deno.serve({
  handler: intercept(
    handle(handlers),
    logging(),
  ),
  port: 3456,
});
