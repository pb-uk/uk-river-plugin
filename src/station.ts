import { fetchStation, fetchStationData } from './api-client/index';
import type { StationDataSeries } from './api-client/index';
import type { Route } from './router';
import { fetchExampleStation, fetchExampleStationData } from './example-data';

import { createTimeSeriesChart } from './time-series-chart';

const plot = (series: StationDataSeries) => {
  const chart = createTimeSeriesChart('#app');
  chart.addSeries({
    data: series.data,
  });
};

const showPlot = async (id: string) => {
  const since = new Date(Date.now() - 86400 * 1000 * 3).toISOString();
  const [categories] = await fetchStationData(id, { since, ascending: true });
  const flowSeriesCount = categories?.flow?.length;
  if (flowSeriesCount > 0) {
    plot(categories.flow[0]);
  }
};

export const stationPage = async ({ params }: Route) => {
  const { id } = params;
  const plotPromise = showPlot(id);
  const station = (await fetchStation(id)).value;
  const el = document.getElementById('app');
  if (el) el.innerHTML = `<div>${station.name}</div>`;
  return plotPromise;
};

export const exampleStationPage = async () => {
  const station = await fetchExampleStation();
  const stationData = await fetchExampleStationData();
  const el = document.getElementById('app');
  if (el) el.innerHTML = `<div>${station.name}</div>`;
  plot(stationData.flow[0]);
};
