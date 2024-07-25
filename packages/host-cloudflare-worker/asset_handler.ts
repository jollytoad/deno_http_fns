import { interceptResponse } from "@http/interceptor/intercept-response";
import { skip } from "@http/interceptor/skip";
import { byMethod } from "@http/route/by-method";
import type { Awaitable, Env } from "./types.ts";

export interface EnvWithAssets extends Env {
  ASSETS?: {
    fetch: (req: Request | URL) => Promise<Response>;
  };
}

export const assetHandler: (
  req: Request,
  env: EnvWithAssets,
) => Awaitable<Response | null> = interceptResponse(
  byMethod({
    GET: (req: Request, env: EnvWithAssets) => {
      const assets = env?.ASSETS;
      return assets && typeof assets.fetch === "function"
        ? assets.fetch(req)
        : null;
    },
  }),
  skip(404, 405),
);
