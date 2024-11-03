export function get(root, segments) {
  let entry = root;
  for (const segment of segments) {
    entry = entry?.[segment];
  }

  return entry;
}

export function pick(obj, ...paths) {
  const picked = {};

  for (const path of paths) {
    picked[path] = obj?.[path];
  }

  return picked;
}

export function set(root, segments, value) {
  const lastSegment = segments.pop();

  let entry = root;
  for (const segment of segments) {
    entry = entry[segment] ||= {};
  }

  entry[lastSegment] = value;
}

export function transform(obj, fn, initial = obj.constructor()) {
  return Object.entries(obj).reduce(
    (prev, [key, value]) => fn(prev, key, value, initial) ?? prev,
    initial
  );
}

export function unset(root, segments) {
  const name = segments.pop();

  let node = root;
  for (const segment of segments) {
    node = node[segment] ||= {};
  }

  delete node[name];
}
