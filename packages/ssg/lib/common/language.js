export function defineGetters(obj, props) {
  const entries = Object.entries(props).map(([key, handler]) => [
    key,
    {
      get() {
        return handler(this);
      },
    },
  ]);

  return Object.defineProperties(obj, Object.fromEntries(entries));
}
