export const stringifyClasses = (...args) =>
  args
    .map(arg => {
      if (arg == null) return "";

      if (Array.isArray(arg)) return stringifyClasses(...arg);

      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([key, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }

      return String(arg);
    })
    .join(" ");
