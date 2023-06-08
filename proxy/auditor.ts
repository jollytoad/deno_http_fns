import { subRef } from "./_substitute.ts";
import type { AuditKind, Auditor, AuditorSpec, Manifest } from "./types.ts";

// deno-lint-ignore require-await
export async function getAuditor(
  _req: Request,
  manifest: Manifest,
): Promise<Auditor> {
  const fnCache = new Map<AuditKind, Auditor>();

  return async (params) => {
    const kind = params.kind;
    let fn = fnCache.get(kind);
    if (!fn) {
      fn = await aggregatedAuditor(kind, manifest.auditors),
        fnCache.set(kind, fn!);
    }
    return fn!(params);
  };
}

async function aggregatedAuditor(
  kind: AuditKind,
  auditorSpecs: AuditorSpec[] = [],
): Promise<Auditor> {
  const fns = await Promise.all(
    auditorSpecs.map((spec) => resolveAuditor(kind, spec)),
  );
  return async (params) => {
    await Promise.all(fns.map((fn) => fn(params)));
  };
}

async function resolveAuditor(
  kind: AuditKind,
  auditorSpec?: AuditorSpec,
): Promise<Auditor> {
  let fn: Auditor | undefined;

  if (!auditorSpec?.kind || auditorSpec.kind.includes(kind)) {
    if (typeof auditorSpec?.fn === "function") {
      fn = auditorSpec.fn;
    } else {
      const moduleRef = subRef(auditorSpec?.module);
      const serviceRef = subRef(auditorSpec?.service);

      if (moduleRef) {
        const module = await import(`${moduleRef}`);
        if (typeof module.default === "function") {
          fn = module.default;
        }
      } else if (serviceRef) {
        fn = fetchAuditor(serviceRef, auditorSpec);
      }
    }

    if (fn && auditorSpec?.params) {
      return (params) => fn?.({ ...params, params: auditorSpec.params });
    }

    if (fn) {
      return async (params) => {
        try {
          return await fn?.(params);
        } catch (e) {
          console.error(
            `%cAuditor failed: ${JSON.stringify(auditorSpec, auditReplacer)}\n`,
            "color: red;",
            e,
          );
        }
      };
    }
  }

  return fn ?? noOp;
}

function noOp() {}

function fetchAuditor(
  url: string | URL,
  auditorSpec?: AuditorSpec,
): Auditor {
  return async (params): Promise<void> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params, auditReplacer),
    });
    if (!response.ok) {
      console.error(
        `%cAuditor failed: ${JSON.stringify(auditorSpec, auditReplacer)}\n`,
        "color: red;",
        `POST ${url} -> ${response.status} ${response.statusText}`,
      );
    }
  };
}

function auditReplacer(_key: string, value: unknown) {
  if (value instanceof Request) {
    return {
      url: value.url,
      method: value.method,
      headers: [...value.headers.entries()],
    };
  }
  if (value instanceof Response) {
    return {
      status: value.status,
      statusText: value.statusText,
      headers: [...value.headers.entries()],
    };
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }
  if (typeof value === "function") {
    return value.name + "()";
  }
  return value;
}
