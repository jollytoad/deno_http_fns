// IMPORTANT: This file has been automatically generated, DO NOT edit by hand.

import routeMapper_2 from "$test/generate/txt_route_mapper.ts";
import { combinedRouteMapper } from "@http/discovery/combined-route-mapper";
import { dynamicRoute } from "@http/discovery/dynamic-route";
import routeMapper_1 from "@http/discovery/ts-route-mapper";

export default dynamicRoute({
  "fileRootUrl": import.meta.resolve("./routes"),
  "eagerness": "startup",
  "routeMapper": combinedRouteMapper(routeMapper_1, routeMapper_2),
  "consolidate": true,
});
