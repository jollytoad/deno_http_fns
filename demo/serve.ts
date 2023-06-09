import { intercept } from "../intercept.ts";
import { handle } from "../handle.ts";
import { byPattern } from "../pattern.ts";
import { byMethod } from "../method.ts";
import { ok } from "../response.ts";
import { staticRoute } from "../static.ts";
import { logRequestGroup } from "../logger.ts";
import { logGroupEnd } from "../logger.ts";
import { logStatusAndContentType } from "../logger.ts";
import { logError } from "../logger.ts";

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
    [logRequestGroup],
    [logGroupEnd, logStatusAndContentType],
    [logGroupEnd, logError],
  ),
  port: 3456,
});
