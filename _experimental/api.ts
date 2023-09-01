// This is the start of an experiment into allowing Request handler
// functions to provide an API definition.

/**
 * A definition of an API
 */
export type ApiDefinition = unknown;

/**
 * A function that provides an ApiDefinition given some options
 */
export type ApiProvider = (opts?: ApiProviderOptions) => ApiDefinition;

/**
 * Symbol for the property of an ApiProvider on a handler function
 */
export const Symbol_apiProvider = Symbol.for(
  "https://deno.land/x/http_fns/ApiProvider",
);

export type WithApiProvider = {
  [Symbol_apiProvider]: ApiProvider;
};

export type ApiProviderOptions = {
  spec?: "openapi@3.1.0";
};

// deno-lint-ignore ban-types
type Handler = Function;

/**
 * Add an ApiProvider function to a handler function
 */
export function withApiProvider<H extends Handler>(
  handler: H,
  api?: ApiProvider,
): typeof api extends ApiProvider ? H & WithApiProvider : H {
  if (api) {
    const handlerWithApi = handler as H & WithApiProvider;
    handlerWithApi[Symbol_apiProvider] = api;
    return handlerWithApi;
  } else {
    return handler;
  }
}

/**
 * Check whether a handler has an ApiProvider
 */
export function hasApiProvider<H extends Handler>(
  handler: H & Partial<WithApiProvider>,
): handler is H & WithApiProvider {
  return typeof handler === "function" &&
    typeof handler[Symbol_apiProvider] === "function";
}

/**
 * Get the ApiProvider from a handler
 */
export function getApiProvider(
  handler: Handler & Partial<WithApiProvider>,
): ApiProvider | undefined {
  return hasApiProvider(handler) ? handler[Symbol_apiProvider] : undefined;
}

/**
 * Get the ApiDefinition from a handler
 */
export function getApi(
  handler: Handler & Partial<WithApiProvider>,
  options?: ApiProviderOptions,
): ApiDefinition | undefined {
  return getApiProvider(handler)?.(options);
}
