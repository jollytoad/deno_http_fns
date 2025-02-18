// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { pageHandler } from "$test/generate/page_handler.ts";
import { byMethod } from "@http/route/by-method";
import { byPattern } from "@http/route/by-pattern";
import { cascade } from "@http/route/cascade";
import * as route_methods_2 from "./handle_txt.ts";
import * as route_methods_4 from "./routes/about.ts";
import route_5 from "./routes/index.ts";
import { body as page_body_3 } from "./routes/page.ts";
import * as route_methods_1 from "./routes/user/:name/index.ts";

export default cascade(
  byPattern("/user/:name{/}?", byMethod(route_methods_1)),
  byPattern("/raw", byMethod(route_methods_2)),
  byPattern(
    "/page",
    pageHandler(page_body_3, import.meta.resolve("./routes/page.ts")),
  ),
  byPattern("/about", byMethod(route_methods_4)),
  byPattern("/", route_5),
);
