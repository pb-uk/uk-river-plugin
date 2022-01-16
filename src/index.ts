import { stationPage, exampleStationPage } from './station';
import type { RouteDefinition } from './router';

const routes: RouteDefinition[] = [
  [/^\/station\/([^/]*)$/, stationPage, ['id']],
  [/^\/example-station([^/]*)$/, exampleStationPage],
];

const run = () => {
  asyncRun().catch((err) => {
    throw err;
  });
};

const asyncRun = async () => {
  const path = window.location.hash.substring(1);

  let i = -1;
  let matches: string[] | null = null;
  while (i < routes.length - 1 && matches === null) {
    ++i;
    matches = path.match(routes[i][0]);
  }

  if (matches === null) {
    console.log('Not found');
    return;
  }
  const [, fn, names] = routes[i];
  const params: Record<string, string> = {};
  (names ?? []).forEach((name, i) => {
    params[name] = (<string[]>matches)[i + 1];
  });
  try {
    await fn({ params });
  } catch (err) {
    console.log(err.name, err.message, err.response);
  }
};

window.addEventListener('hashchange', run, false);
run();
