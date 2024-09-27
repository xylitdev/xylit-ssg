import { compileAsync, compileStringAsync } from "sass";

export const transformSass = async (input, { src }) => {
  const options = { loadPaths: ["node_modules", "../../node_modules"] };

  return src
    ? await compileAsync(src, options)
    : await compileStringAsync(input, options);
};
