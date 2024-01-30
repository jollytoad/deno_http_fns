// This is the start of an experiment into allowing a Request handler
// function to expose a Descriptor that describes the behaviour of the handler.

type UrlComponent =
  | "protocol"
  | "username"
  | "password"
  | "hostname"
  | "port"
  | "pathname"
  | "search"
  | "hash";

type UrlDescriminator = "url" | `url.${UrlComponent}`;

type MethodDescriminator = "method";

type HeaderDescriminator = "header" | `header.${string}`;

export type RouteDescriminator =
  | UrlDescriminator
  | MethodDescriminator
  | HeaderDescriminator;

export interface Descriptor<N extends Handler> {
  handler: N;
  descriminator: RouteDescriminator;
  pattern?: URLPattern[];
  method?: string[];
  header?: string[];
}

// deno-lint-ignore ban-types
type Handler = Function;

/**
 * Symbol for the property of a Descriptor provider function on a handler function
 */
export const Symbol_descriptors = Symbol.for(
  "https://deno.land/x/http_fns/Descriptors",
);

export type WithDescriptors<N extends Handler> = {
  [Symbol_descriptors](): Descriptor<N>[];
};

/**
 * Add a Descriptor to a handler function
 */
export function withDescriptors<N extends Handler, O extends Handler>(
  handler: O,
  descriptors: () => Descriptor<N>[],
): O & WithDescriptors<N> {
  const handlerWithDescriptors = handler as O & WithDescriptors<N>;
  handlerWithDescriptors[Symbol_descriptors] = descriptors;
  return handlerWithDescriptors;
}

/**
 * Check whether a handler has a Descriptor provider function
 */
export function hasDescriptors<N extends Handler>(
  handler: Partial<WithDescriptors<N>>,
): handler is WithDescriptors<N> {
  return typeof handler === "function" &&
    typeof handler[Symbol_descriptors] === "function";
}

/**
 * Get the Descriptors from a handler
 */
export function getDescriptors<N extends Handler>(
  handler: Partial<WithDescriptors<N>>,
): Descriptor<N>[] {
  return hasDescriptors<N>(handler) ? handler[Symbol_descriptors]() : [];
}
