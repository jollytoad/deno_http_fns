/**
 * Declare the rules for access to an API, and mapping from proxy route
 * to target route.
 *
 * eg: https://proxy.example.com/<path> -> <target>/<path>
 */
export type Manifest = {
  target: string;
  rolesProvider?: RolesProviderSpec;
  auditors?: AuditorSpec[];
  routeRules?: RouteRule[];
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

export type Params = Record<string, string>;

export interface RolesProviderSpec {
  as?: Role[];
  fn?: RolesProvider;
  module?: string | URL;
  service?: string | URL;
  params?: Params;
}

export type RolesProvider = (
  req: Request,
  params?: Params,
) => Role[] | Promise<Role[] | undefined> | undefined;

export interface AuditorSpec {
  kind?: AuditKind[];
  fn?: Auditor;
  module?: string | URL;
  service?: string | URL;
  params?: Params;
}

export type AuditKind = "denied" | "request" | "response" | "error";

export type Auditor = (params: AuditRecord) => void | Promise<void>;

export interface AuditRecord {
  kind: AuditKind;
  roles?: Role[];
  rule: RouteRule;
  request: Request;
  response?: Response;
  error?: unknown;
  params?: Params;
}
