// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";
import { cascade } from "https://deno.land/x/http_fns/lib/cascade.ts";
import { lazy } from "https://deno.land/x/http_fns/lib/lazy.ts";

export default cascade(
  byPattern("/user/:name", lazy(() => import("./routes/user/[name].ts"))),
  byPattern("/", lazy(() => import("./routes/index.ts"))),
);
