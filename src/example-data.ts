import type { Station } from './api-client/station';
import type { StationData } from './api-client/station-data';

export const fetchExampleStation = (): Promise<Station> => {
  return Promise.resolve({
    id: 'ExampleId',
    name: 'Example station',
  });
};

export const fetchExampleStationData = (): Promise<StationData> => {
  const stationData: StationData = {
    flow: [
      {
        data: [],
      },
    ],
  };
  let flow = 100;
  for (
    let timestamp = Date.now() - 3 * 24 * 60 * 60 * 1000;
    timestamp < Date.now();
    timestamp += 14 * 60 * 1000 + Math.random() * 2 * 60 * 1000
  ) {
    flow = Math.round(10 * (flow + Math.random() * 1 - 0.5)) / 10;
    stationData.flow[0].data.push([new Date(timestamp), flow]);
  }
  return Promise.resolve(stationData);
};
