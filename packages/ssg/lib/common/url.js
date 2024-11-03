export function createURL(url, modifier) {
  url = Object.assign(new URL(url), modifier);

  return url;
}
