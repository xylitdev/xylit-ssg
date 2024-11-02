import { less, scss, sass } from "../templating/literals.js";

import { Resource } from "./resource.js";

export async function generateStyle(ir) {
  const resource = new Resource({
    contents: await ir.join(),
    url: ir.url,
    mediaType: "text/css",
  });

  if (ir instanceof less) resource.mediaType = "text/less";
  if (ir instanceof sass) resource.mediaType = "text/x-sass";
  if (ir instanceof scss) resource.mediaType = "text/x-scss";

  return resource;
}
