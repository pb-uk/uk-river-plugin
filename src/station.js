import { createSvgElememt } from './dom.js';

import { fetchStation, fetchStationData } from './api-client/index.js';

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

export const stationPage = async ({ params }) => {
  const { id } = params;
  showPlot(id);
  const [station] = await fetchStation(id);
  document.getElementById('app').prepend(`${station.label}`);
};

export const exampleStationPage = async () => {
  const station = { label: 'Example station' };
  document.getElementById('app').prepend(`${station.label}`);
  // showPlot(id);
};
