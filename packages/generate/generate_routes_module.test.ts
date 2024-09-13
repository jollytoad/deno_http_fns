import { withFallback } from "@http/route/with-fallback";
import {
  type GenerateOptions,
  generateRoutesModule,
} from "./generate_routes_module.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { getAvailablePort } from "@std/net/get-available-port";
import {
  assertStatus,
  STATUS_CODE,
  type StatusCode,
} from "@http/assert/status";
import { assertStringIncludes } from "@std/assert";
import { dprintFormatModule } from "./dprint_format_module.ts";

const fileRootUrl = import.meta.resolve("./_test/routes");

Deno.test("Generate with startup time discovery", async (t) => {
  const moduleOutUrl = import.meta.resolve(
    "./_test/routes_startup_discovery.ts",
  );

  await testGenerateRoutesModule(t, {
    moduleOutUrl,
    routeDiscovery: "startup",
  });

  await testRoutes(t, moduleOutUrl);
});

Deno.test("Generate with request time discovery", async (t) => {
  const moduleOutUrl = import.meta.resolve(
    "./_test/routes_request_discovery.ts",
  );

  await testGenerateRoutesModule(t, {
    moduleOutUrl,
    routeDiscovery: "request",
  });

  await testRoutes(t, moduleOutUrl);
});

Deno.test("Generate with static imports", async (t) => {
  const moduleOutUrl = import.meta.resolve("./_test/routes_static_imports.ts");

  await testGenerateRoutesModule(t, {
    moduleOutUrl,
    moduleImports: "static",
  });

  await testRoutes(t, moduleOutUrl);
});

Deno.test("Generate with dynamic imports", async (t) => {
  const moduleOutUrl = import.meta.resolve("./_test/routes_dynamic_imports.ts");

  await testGenerateRoutesModule(t, {
    moduleOutUrl,
    moduleImports: "dynamic",
  });

  await testRoutes(t, moduleOutUrl);
});

Deno.test("Generate with default opts", async (t) => {
  const moduleOutUrl = import.meta.resolve("./_test/routes_default_opts.ts");

  await generateRoutesModule({
    fileRootUrl,
    moduleOutUrl,
  });

  await assertSnapshot(t, await Deno.readTextFile(new URL(moduleOutUrl)));
});

async function testGenerateRoutesModule(
  t: Deno.TestContext,
  opts: Pick<
    GenerateOptions,
    "moduleOutUrl" | "moduleImports" | "routeDiscovery"
  >,
) {
  await t.step("generate module", async (t) => {
    await generateRoutesModule({
      ...opts,
      fileRootUrl,
      formatModule: dprintFormatModule(),
      routeMapper: [
        "$test/generate/ignored_route_mapper.ts",
        "@http/discovery/ts-route-mapper",
        "$test/generate/txt_route_mapper.ts",
      ],
      handlerGenerator: [
        import("$test/generate/page_handler_generator.ts"),
        import("@http/generate/default-handler-generator"),
        import("@http/generate/methods-handler-generator"),
      ],
    });

    await assertSnapshot(
      t,
      await Deno.readTextFile(new URL(opts.moduleOutUrl)),
    );
  });
}

async function testRoutes(t: Deno.TestContext, routesModule: string) {
  await t.step("test routes", async (t) => {
    // import the generated routes module
    const routes = (await import(routesModule)).default;

    // start a server using the routes
    const port = getAvailablePort();
    const ready = Promise.withResolvers();
    await using _server = Deno.serve({
      port,
      onListen: () => ready.resolve(`http://localhost:${port}`),
    }, withFallback(routes));
    const baseUrl = await ready.promise;

    // hit the server
    await testRoute(t, "GET", `${baseUrl}`, STATUS_CODE.OK);
    await testRoute(t, "GET", `${baseUrl}/about`, STATUS_CODE.OK);
    await testRoute(t, "GET", `${baseUrl}/unknown`, STATUS_CODE.NotFound);
    await testRoute(t, "GET", `${baseUrl}/user/bob`, STATUS_CODE.OK);
    await testRoute(t, "PUT", `${baseUrl}/user/bob`, STATUS_CODE.Accepted);
    await testRoute(
      t,
      "DELETE",
      `${baseUrl}/user/bob`,
      STATUS_CODE.MethodNotAllowed,
    );
    await testRoute(
      t,
      "GET",
      `${baseUrl}/raw`,
      STATUS_CODE.OK,
      async (response) => {
        const content = await response.text();
        assertStringIncludes(content, "Hello");
      },
    );
    await testRoute(
      t,
      "GET",
      `${baseUrl}/page`,
      STATUS_CODE.OK,
      async (response) => {
        const content = await response.text();
        assertStringIncludes(content, "<h1>Hello</h1>");
        assertStringIncludes(content, "<!DOCTYPE html>");
      },
    );
  });
}

async function testRoute(
  t: Deno.TestContext,
  method: string,
  url: string,
  expectedStatus: StatusCode,
  checkResponse?: (response: Response) => Promise<void>,
) {
  await t.step(`${method} ${url} -> ${expectedStatus}`, async () => {
    const response = await fetch(url, { method });
    assertStatus(response, expectedStatus);
    if (checkResponse) {
      await checkResponse(response);
    }
    if (response.body && !response.bodyUsed) {
      response.body.cancel();
    }
  });
}
