const cache = new WeakMap<WeakKey, WeakMap<WeakKey, unknown>>();

const originalFunctionSymbol = Symbol();

/**
 * Memoize a function, so that the result from the first call for a given argument is cached,
 * and returned with subsequent calls with the same argument.
 *
 * One of the most practical uses for this is to associate contextual information against a Request,
 * so that information can be obtained when and only when required and cached for use elsewhere,
 * in other handlers, interceptors, or middleware.
 *
 * This alleviates the need to pre-calculate Request context/state in middleware on the off-chance a
 * handler may require it, and avoids the need to extend the Request object with additional properties.
 *
 * @template I the type of the argument of the memoized function, it must be usable as a WeakKey
 * @template O the return type of the memoized function
 * @param fn the function to memoize
 * @param key a unique key to represent the function in the cache, defaults to the function itself.
 * @returns a function that caches the result
 */
export function memoize<I extends WeakKey, O>(
  fn: (arg: I) => O,
  key: WeakKey = fn,
): (arg: I) => O {
  const memoizedFn = (arg: I): O => {
    let memos = cache.get(arg);

    if (memos?.has(key)) {
      return memos.get(key)! as O;
    }

    const value = fn(arg);

    if (!memos) {
      memos = new Map();
      cache.set(arg, memos);
    }

    memos.set(key, value);

    return value;
  };
  memoizedFn[originalFunctionSymbol] = fn;
  return memoizedFn;
}

/**
 * Invalidate the cached results of a particular argument and function combination,
 * or all function results for a given argument.
 *
 * @param arg the argument to invalidate memoized results of
 * @param key limit to a particular key/function, this can be the original function or memoized function
 */
export function invalidate(arg: WeakKey, key?: WeakKey) {
  if (key) {
    cache.get(arg)?.delete(getOriginalKey(key));
  } else {
    cache.delete(arg);
  }
}

/**
 * Invalidate the cached result of a particular argument and function,
 * returning the cached value, if it exists for further disposal.
 *
 * @param arg the argument to invalidate a memoized result of
 * @param key the key/function result to invalidate
 * @returns the cached result of the function for the argument if present
 */
export function dispose<I extends WeakKey, O>(
  arg: WeakKey,
  key: WeakKey | ((arg: I) => O),
): O | undefined {
  const originalKey = getOriginalKey(key);
  const val = cache.get(arg)?.get(originalKey) as O;
  cache.get(arg)?.delete(originalKey);
  return val;
}

function getOriginalKey(key: WeakKey): WeakKey {
  return typeof key === "function" && originalFunctionSymbol in key &&
      key[originalFunctionSymbol]
    ? key[originalFunctionSymbol]
    : key;
}
