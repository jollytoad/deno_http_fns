// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import routeMapper_1 from "$test/generate/ignored_route_mapper.ts";
import handlerMapper_1 from "$test/generate/page_handler_mapper.ts";
import routeMapper_3 from "$test/generate/txt_route_mapper.ts";
import { cascadingHandlerMapper } from "@http/discovery/cascading-handler-mapper";
import { combinedRouteMapper } from "@http/discovery/combined-route-mapper";
import handlerMapper_2 from "@http/discovery/default-handler-mapper";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import handlerMapper_3 from "@http/discovery/methods-handler-mapper";
import routeMapper_2 from "@http/discovery/ts-route-mapper";

export default dynamicRoute({
  "fileRootUrl": import.meta.resolve("./routes"),
  "eagerness": "startup",
  "routeMapper": combinedRouteMapper(
    routeMapper_1,
    routeMapper_2,
    routeMapper_3,
  ),
  "handlerMapper": cascadingHandlerMapper(
    handlerMapper_1,
    handlerMapper_2,
    handlerMapper_3,
  ),
  "consolidate": true,
});
