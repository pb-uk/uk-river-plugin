import { createSvgElememt } from './dom.js';

import { fetchStation, fetchStationData } from './api-client.js';

const plot = (data) => {
  const svg = createSvgElememt('svg', { viewBox: '0 0 100 100' });
  console.log(data);
  const d = 'M10,10H90V90H10Z';

  svg.append(
    createSvgElememt('path', {
      fill: 'lightblue',
      stroke: 'blue',
      d,
    })
  );
  document.getElementById('app').append(svg);
};

const showPlot = async (id) => {
  const since = new Date(Date.now() - 86400 * 1000 * 3).toISOString();
  const [data] = await fetchStationData(id, { since, ascending: true });
  plot(data);
};

const showStation = async ({ params }) => {
  const { id } = params;
  showPlot(id);
  const [station] = await fetchStation(id);
  document.getElementById('app').prepend(`${station.label}`);
};

const showExampleStation = async () => {
  const station = { label: 'Example station' };
  document.getElementById('app').prepend(`${station.label}`);
  // showPlot(id);
};

const routes = [
  [/^\/station\/([^/]*)$/, showStation, ['id']],
  [/^\/example-station\/([^/]*)$/, showExampleStation],
];

const run = async () => {
  const path = window.location.hash.substring(1);

  let i = -1;
  let matches = null;
  while (i < routes.length - 1 && matches === null) {
    ++i;
    matches = path.match(routes[i][0]);
  }

  if (matches === null) {
    console.log('Not found');
    return;
  }
  const [, fn, names] = routes[i];
  const params = {};
  (names ?? []).forEach((name, i) => {
    params[name] = matches[i + 1];
  });
  try {
    await fn({ params });
  } catch (err) {
    console.log(err.name, err.message, err.response);
  }
};

window.addEventListener('hashchange', run, false);
run();
