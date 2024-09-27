import { DepGraph } from "dependency-graph";

const graph = new DepGraph({ circular: true });

export const addDependency = (url, ...dependencies) => {
  graph.addNode(url);

  dependencies.forEach(dependency => {
    graph.addNode(dependency);
    graph.addDependency(url, dependency);
  });
};

export const dependantsOf = (name, leavesOnly) => {
  try {
    return graph.dependantsOf(name, leavesOnly);
  } catch (e) {
    console.warn(e);
  }

  return [];
};
