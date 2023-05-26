/**
 * Declare the rules for access to an API, and mapping from proxy route
 * to target route.
 *
 * eg: https://proxy.example.com/<path> -> <target>/<path>
 */
export type Manifest = {
  target: string;
  routeRules?: RouteRule[];
  rolesProvider?: Provider<Role[]>;
};

export type RouteRule = {
  pattern: URLPatternInput | URLPattern | Array<URLPatternInput | URLPattern>;
  method?: Method | Method[] | "*";
  role?: Role | Role[] | "*";
  allow?: boolean;
  headers?: Record<string, string>;
};

export type Role = string;

export type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type ProviderFn<R> = (
  req: Request,
  params?: Record<string, string>,
) => R | Promise<R | undefined> | undefined;

export interface Provider<R> {
  as?: R;
  fn?: ProviderFn<R>;
  module?: string | URL;
  service?: string | URL;
  params?: Record<string, string>;
}
