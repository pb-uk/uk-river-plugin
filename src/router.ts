export type Route = {
  params: Record<string, string>;
};

export type RouteDefinition = [RegExp, RouteFunction, string[]?];

type RouteFunction = (a: Route) => Promise<void> | void;
