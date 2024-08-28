// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/route/by-method";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";
import { lazy } from "@http/route/lazy";

export default cascade(byPattern("/user/:name{/}?", lazy(async () => byMethod(await import("./routes/user/:name/index.ts")))), byPattern("/about", lazy(async () => byMethod(await import("./routes/about.ts")))), byPattern("/", lazy(() => import("./routes/index.ts"))));