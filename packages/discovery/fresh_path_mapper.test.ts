import { assertEquals, fail } from "@std/assert";
import { discoverRoutes } from "./discover_routes.ts";
import freshPathMapper from "./fresh_path_mapper.ts";
import { join } from "@std/path/posix/join";
import { asSerializablePattern } from "./as_serializable_pattern.ts";

const fileRootUrl = import.meta.resolve("./_test/_fresh_routes");

Deno.test("freshPathMapper", async (t) => {
  const routes = await discoverRoutes({
    fileRootUrl,
    pathMapper: freshPathMapper,
    verbose: true,
  });

  const expectedRoutes: [string, string][] = [
    ["/", "index.ts"],
    ["/about", "about.ts"],
    ["/blog", "blog/index.ts"],
    ["/blog/:slug", "blog/[slug].ts"],
    ["/blog/:slug/comments", "blog/[slug]/comments.ts"],
    ["/old/:path*", "old/[...path].ts"],
    ["/docs/:version?", "docs/[[version]]/index.ts"],
    ["/archive", "(info)/archive.tsx"],
    ["/contact", "(info)/contact.tsx"],
    ["/hello-:name", "hello-[name].ts"],
    ["/hello-:firstName-:lastName", "hello-[firstName]-[lastName].ts"],
    ["/optional-:name?", "optional-[[name]].ts"],

    // extensions (not standard fresh mapping)
    ["/extensions/required{.:ext}", "extensions/required.ext.ts"],
    ["/extensions/optional{.:ext}?", "extensions/optional[.ext].ts"],
  ];

  for (const [expectedPattern, modulePath] of expectedRoutes) {
    await t.step(`${expectedPattern} -> ${modulePath}`, () => {
      assertRoute(expectedPattern, modulePath);
    });
  }

  function assertRoute(expectedPattern: string, modulePath: string) {
    const expectedModule = new URL(fileRootUrl);
    expectedModule.pathname = join(expectedModule.pathname, modulePath);
    for (const { pattern, module } of routes) {
      if (asSerializablePattern(pattern) === expectedPattern) {
        assertEquals(module, expectedModule);
        return;
      }
    }
    fail(`no route found for: ${expectedPattern} -> ${modulePath}`);
  }
});
