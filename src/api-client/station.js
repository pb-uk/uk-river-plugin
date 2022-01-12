import { request } from './request';
import { parseMeasureId } from './measure';

const parseStationResponse = (data) => {
  return data.items;
};

const parseStationDataResponse = (data, options = {}) => {
  const series = {};
  data.items.forEach(({ measure, dateTime, value }) => {
    series[measure] = series[measure] || [];
    series[measure].push([new Date(dateTime), parseFloat(value)]);
  });
  const categories = {};
  Object.entries(series).forEach(([key, data]) => {
    const measure = parseMeasureId(key);
    categories[measure.parameter] = categories[measure.parameter] || [];
    categories[measure.parameter].push({ measure, data });
  });

  const { ascending, descending } = options;
  if (ascending || descending) {
    console.log('Sorting', ascending, descending);
    // const compare = ascending ? (a, b) => a[0].valueOf() - b[0].valueOf() : (a, b) => b[0].valueOf() - a[0].valueOf();
    const compare = ascending ? ([a], [b]) => a - b : ([a], [b]) => b - a;
    Object.entries(categories).forEach(([, series]) => {
      series.forEach((entry) => {
        entry.data.sort(compare);
      });
    });
  }
  return categories;
};

export const fetchStation = async (id) => {
  const response = await request(`/id/stations/${id}`);
  return [parseStationResponse(await response.json()), response];
};

const stationDataDefaults = {
  sorted: true,
  limit: 1000,
};

export const fetchStationData = async (id, options = {}) => {
  const settings = { ...stationDataDefaults, ...options };
  const { ascending, descending, since, limit: _limit } = settings;
  const _sorted = ascending || descending ? '' : undefined;
  const params = { _sorted, since, _limit };
  const response = await request(`/id/stations/${id}/readings`, { params });
  return [
    parseStationDataResponse(await response.json(), { ascending, descending }),
    response,
  ];
};
