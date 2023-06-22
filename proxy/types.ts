import type { HttpMethod } from "https://deno.land/std@0.192.0/http/method.ts";
import type { RoutePattern, Skip } from "../types.ts";

export type { HttpMethod };

/**
 * Declare the rules for access to an API, and mapping from proxy route
 * to target route.
 *
 * eg: https://proxy.example.com/<path> -> <target>/<path>
 */
export interface Manifest {
  target: string;
  rolesProvider?: RolesProviderSpec;
  auditors?: AuditorSpec[];
  routeRules?: RouteRule[];
}

export type RouteMethod = HttpMethod | HttpMethod[] | "*";

export interface RouteRule {
  pattern: RoutePattern;
  method?: RouteMethod;
  role?: Role | Role[] | "*";
  allow?: boolean;
  headers?: Record<string, string>;
}

interface PluggableFn<F> {
  fn?: F;
  module?: string | URL;
  service?: string | URL;
  params?: Params;
}

export type Params = Record<string, string>;

export type Role = string;

export interface RolesProviderSpec extends PluggableFn<RolesProvider> {
  as?: Role[];
}

export type RolesProvider = (
  req: Request,
  params?: Params,
) => Role[] | Promise<Role[] | undefined> | undefined;

export interface AuditorSpec extends AuditorFnSpec {
  kind?: AuditKind[];
  pattern?: RoutePattern;
  method?: RouteMethod;
  /**
   * Chain of Auditors, the result of each auditor is passed to the next in the chain,
   * unless an explicit skip (null) is returned.
   * The chain will execute before the auditor defined directly in the AuditorSpec.
   */
  chain?: (AuditorFnSpec | Auditor)[];
}

export type AuditorFnSpec = PluggableFn<Auditor>;

export type AuditKind = "denied" | "request" | "response" | "error" | "aborted";

export type Auditor = (
  props: AuditProps,
) => AuditResult | Promise<AuditResult>;

export interface AuditProps {
  kind: AuditKind;
  roles?: Role[];
  rule: RouteRule;
  request: Request;
  response?: Response;
  error?: unknown;
  reason?: unknown;
  params?: Params;
}

export type AuditResult = void | Skip | AuditProps;
