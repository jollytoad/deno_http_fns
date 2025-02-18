import { withFallback } from "@http/route/with-fallback";
import { getAvailablePort } from "@std/net/get-available-port";
import { STATUS_CODE, type StatusCode } from "@http/assert/status";
import type { Awaitable } from "./types.ts";
import { assertEquals } from "@std/assert/equals";

benchRouter("routes_startup_discovery.ts");
benchRouter("routes_request_discovery.ts");
benchRouter("routes_flat_dynamic_imports.ts");
benchRouter("routes_tree_dynamic_imports.ts");
benchRouter("routes_flat_static_imports.ts");
benchRouter("routes_tree_static_imports.ts");

type Router = (request: Request) => Awaitable<Response | null>;
type TestRoute = (
  method: string,
  url: string,
  expectedStatus: StatusCode,
) => Promise<void>;

function benchRouter(routerModule: string) {
  Deno.bench({
    name: routerModule,
    group: "via fetch/server",
    fn: async (b) => {
      // import the generated routes module
      const router = await loadRouter(routerModule);

      // start a server using the routes
      const port = getAvailablePort();
      const ready = Promise.withResolvers<string>();
      await using _server = Deno.serve({
        port,
        onListen: () => ready.resolve(`http://localhost:${port}`),
      }, withFallback(router));

      const baseUrl = await ready.promise;
      const testRoute = testRouteViaFetch();

      await hitRoutes(baseUrl, testRoute);

      b.start();
      await hitRoutes(baseUrl, testRoute);
      b.end();
    },
  });

  Deno.bench({
    name: routerModule,
    group: "direct router fn call",
    fn: async (b) => {
      // import the generated routes module
      const router = await loadRouter(routerModule);
      const baseUrl = `http://localhost:8000`;
      const testRoute = testRouteDirect(router);

      await hitRoutes(baseUrl, testRoute);

      b.start();
      await hitRoutes(baseUrl, testRoute);
      b.end();
    },
  });
}

async function hitRoutes(baseUrl: string, testRoute: TestRoute) {
  await testRoute("GET", `${baseUrl}`, STATUS_CODE.OK);
  await testRoute("GET", `${baseUrl}/about`, STATUS_CODE.OK);
  await testRoute("GET", `${baseUrl}/unknown`, STATUS_CODE.NotFound);
  await testRoute("GET", `${baseUrl}/user/bob`, STATUS_CODE.OK);
  await testRoute("PUT", `${baseUrl}/user/bob`, STATUS_CODE.Accepted);
  await testRoute(
    "DELETE",
    `${baseUrl}/user/bob`,
    STATUS_CODE.MethodNotAllowed,
  );
  await testRoute("GET", `${baseUrl}/raw`, STATUS_CODE.OK);
  await testRoute("GET", `${baseUrl}/page`, STATUS_CODE.OK);
}

async function loadRouter(routerModule: string): Promise<Router> {
  return (await import(import.meta.resolve(`./_test/${routerModule}`))).default;
}

function testRouteViaFetch(): TestRoute {
  return async (method, url, expectedStatus) => {
    const response = await fetch(url, { method });
    assertEquals(response.status, expectedStatus);
    if (response.body && !response.bodyUsed) {
      response.body.cancel();
    }
  };
}

function testRouteDirect(router: Router): TestRoute {
  const completeRouter = withFallback(router);
  return async (method, url, expectedStatus) => {
    const request = new Request(url, { method });
    const response = await completeRouter(request);
    assertEquals(response.status, expectedStatus);
    if (response.body && !response.bodyUsed) {
      response.body.cancel();
    }
  };
}
