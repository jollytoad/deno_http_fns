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
 * Invalidate the cached results of a particular function and argument combo,
 * or all functions results for a given argument.
 *
 * @param arg the function argument to invalidate all memoized results of
 * @param key limit to a particular key/function, this can be the original function or memoized function
 */
export function invalidate(arg: WeakKey, key?: WeakKey) {
  if (key) {
    cache.get(arg)?.delete(key);
    if (
      typeof key === "function" && originalFunctionSymbol in key &&
      key[originalFunctionSymbol]
    ) {
      cache.get(arg)?.delete(key[originalFunctionSymbol]);
    }
  } else {
    cache.delete(arg);
  }
}
