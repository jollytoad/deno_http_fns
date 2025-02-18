// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { pageHandler } from "$test/generate/page_handler.ts";
import { byMethod } from "@http/route/by-method";
import { byPathTree } from "@http/route/by-path-tree";
import { byPattern } from "@http/route/by-pattern";
import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";
import * as route_methods_2 from "./handle_txt.ts";
import * as route_methods_4 from "./routes/about.ts";
import route_5 from "./routes/index.ts";
import { body as page_body_3 } from "./routes/page.ts";
import * as route_methods_1 from "./routes/user/:name/index.ts";

export default byPathTree({
  "user": {
    [WILD]: {
      [GUARD]: [byPattern("/user/:name{/}?", byMethod(route_methods_1))],
    },
  },
  "raw": { [LEAF]: [byMethod(route_methods_2)] },
  "page": {
    [LEAF]: [pageHandler(page_body_3, import.meta.resolve("./routes/page.ts"))],
  },
  "about": { [LEAF]: [byMethod(route_methods_4)] },
  "": { [LEAF]: [route_5] },
});
