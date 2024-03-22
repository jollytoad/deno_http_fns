// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/fns/by_method";
import { lazy } from "@http/fns/lazy";
import { byPattern } from "@http/fns/by_pattern";
import { cascade } from "@http/fns/cascade";

export default cascade(
  byPattern("/user/:name", lazy(() => import("./routes/user/[name].ts"))),
  byPattern(
    "/methods",
    lazy(async () => byMethod(await import("./routes/methods.ts"))),
  ),
  byPattern("/", lazy(() => import("./routes/index.ts"))),
);
