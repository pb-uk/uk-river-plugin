import { createSvgElememt } from './dom';

import { fetchStation, fetchStationData } from './api-client/index';
import type { StationDataSeries } from './api-client/index';
import type { Route } from './router';

const plot = (data: StationDataSeries) => {
  const svg = createSvgElememt('svg', { viewBox: '0 0 100 100' });
  const d = 'M10,10H90V90H10Z';
  console.log(data);
  svg.append(
    createSvgElememt('path', {
      fill: 'lightblue',
      stroke: 'blue',
      d,
    })
  );
  const el = document.getElementById('app');
  if (el) el.append(svg);
};

const showPlot = async (id: string) => {
  const since = new Date(Date.now() - 86400 * 1000 * 3).toISOString();
  const categories = await fetchStationData(id, { since, ascending: true });
  console.log(categories);
  // plot(categories.level[0]);
};

export const stationPage = async ({ params }: Route) => {
  const { id } = params;
  const plotPromise = showPlot(id);
  const [station] = await fetchStation(id);
  const el = document.getElementById('app');
  if ('label' in station && typeof station.label === 'string') {
    if (el) el.prepend(`${station.label}`);
  }
  return plotPromise;
};

export const exampleStationPage = () => {
  const station = { label: 'Example station' };
  const el = document.getElementById('app');
  if (el) el.prepend(`${station.label}`);
  // showPlot(id);
};
