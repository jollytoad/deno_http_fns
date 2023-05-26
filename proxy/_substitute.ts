/**
 * Substitute any `${VAR}` placeholders in a string with the value of the environment variable.
 * If any environment variable is not set and a default is not provided, the function returns undefined.
 */
export function subEnvVars(
  value: string,
  defaults: Record<string, string> = {},
): string | undefined {
  let valid = true;
  value = value.replaceAll(/\$\{([^}]+)\}/g, (match, key) => {
    if (Deno.env.has(key) || key in defaults) {
      return Deno.env.get(key) ?? defaults[key];
    } else {
      valid = false;
      return match;
    }
  });
  return valid ? value : undefined;
}

export function subValues(
  record: Record<string, string>,
  defaults: Record<string, string> = {},
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    const subValue = subEnvVars(value, defaults);
    if (subValue) {
      result[key] = subValue;
    }
  }

  return result;
}

export function subHeaders(
  record: Record<string, string>,
  headers: Headers,
  defaults: Record<string, string> = {},
): Headers {
  for (const [name, value] of Object.entries(record)) {
    const subValue = subEnvVars(value, defaults);
    if (subValue) {
      headers.set(name, subValue);
    }
  }
  return headers;
}
