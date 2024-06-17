// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { byMethod } from "@http/route/by-method";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";
import * as route_2 from "./handle_txt.ts";
import * as route_3 from "./routes/about.ts";
import route_4 from "./routes/index.ts";
import * as route_1 from "./routes/user/:name/index.ts";

export default cascade(
  byPattern("/user/:name{/}?", byMethod(route_1)),
  byPattern("/raw", byMethod(route_2)),
  byPattern("/about", byMethod(route_3)),
  byPattern("/", route_4),
);
