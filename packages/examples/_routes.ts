// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/route/by-method";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";
import { lazy } from "@http/route/lazy";

export default cascade(
  byPattern(
    "/user/:name",
    lazy(async () => (await import("./_routes/user/[name].ts")).default),
  ),
  byPattern(
    "/methods",
    lazy(async () => byMethod(await import("./_routes/methods.ts"))),
  ),
  byPattern(
    "/",
    lazy(async () => (await import("./_routes/index.ts")).default),
  ),
);
