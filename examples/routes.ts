// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "@http/fns/by_pattern";
import { cascade } from "@http/fns/cascade";
import { lazy } from "@http/fns/lazy";

export default cascade(
  byPattern("/user/:name", lazy(() => import("./routes/user/[name].ts"))),
  byPattern("/", lazy(() => import("./routes/index.ts"))),
);
