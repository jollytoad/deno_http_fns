// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import { pageHandler } from "$test/generate/page_handler.ts";
import { byMethod } from "@http/route/by-method";
import { byPathTree } from "@http/route/by-path-tree";
import { byPattern } from "@http/route/by-pattern";
import { lazy } from "@http/route/lazy";
import { GUARD, LEAF, WILD } from "@http/route/path-tree/symbols";

export default byPathTree({
  "user": {
    [WILD]: {
      [GUARD]: [byPattern(
        "/user/:name{/}?",
        lazy(async () =>
          byMethod(await import("./routes/user/:name/index.ts"))
        ),
      )],
    },
  },
  "raw": {
    [LEAF]: [byPattern(
      "/raw",
      lazy(async () => byMethod(await import("./handle_txt.ts"))),
    )],
  },
  "page": {
    [LEAF]: [byPattern(
      "/page",
      lazy(async () =>
        pageHandler(
          (await import("./routes/page.ts")).body,
          import.meta.resolve("./routes/page.ts"),
        )
      ),
    )],
  },
  "about": {
    [LEAF]: [byPattern(
      "/about",
      lazy(async () => byMethod(await import("./routes/about.ts"))),
    )],
  },
  "": {
    [LEAF]: [byPattern(
      "/",
      lazy(async () => (await import("./routes/index.ts")).default),
    )],
  },
});
