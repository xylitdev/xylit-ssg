export function stringifyClasses(...args) {
  return args
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
}

export function stringifyAttribues(value) {
  if (Array.isArray(value)) {
    return value
      .filter(value => !isBoolean(value) && !isNullish(value))
      .join(" ");
  } else if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, value]) => {
        const q = String(value).includes('"') ? "'" : '"';

        return `${key}=${q}${value}${q}`;
      })
      .join(" ");
  }

  return String(value);
}
