export const lazy = promise =>
  new Proxy(promise, {
    get(target, key) {
      if (key in target) {
        if (typeof target[key] === "function") {
          return target[key].bind(target);
        }

        return Reflect.get(target, key, target);
      }

      return lazy(promise.then(resolved => resolved?.[key]));
    },
  });
