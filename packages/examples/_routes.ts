// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/route/by-method";
import { lazy } from "@http/handler/lazy";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";

export default cascade(
  byPattern("/user/:name", lazy(() => import("./_routes/user/[name].ts"))),
  byPattern(
    "/methods",
    lazy(async () => byMethod(await import("./_routes/methods.ts"))),
  ),
  byPattern("/", lazy(() => import("./_routes/index.ts"))),
);
