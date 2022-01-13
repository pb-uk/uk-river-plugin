import { request } from './request';
import type { ApiCollectionResponseData, ApiItemResponseData } from './request';
import { parseMeasureId } from './measure';

type ApiResponseStationDataItem = {
  measure: string;
  dateTime: string;
  value: string;
};

type StationDataOptions = {
  limit?: number;
  ascending?: boolean;
  descending?: boolean;
  since?: string;
};

type StationDataItem = [Date, number];

export type StationDataSeries = {
  measure: Record<string, unknown>;
  data: StationDataItem[];
};

const parseStationResponse = (data: ApiItemResponseData) => {
  return data.items;
};

const parseStationDataResponse = (
  data: ApiCollectionResponseData<ApiResponseStationDataItem>,
  options: StationDataOptions = {}
): Record<string, StationDataSeries[]> => {
  // Build an object grouping series of readings with the same measure Id.
  const series: Record<string, StationDataItem[]> = {};
  data.items.forEach(({ measure, dateTime, value }) => {
    series[measure] = series[measure] || [];
    series[measure].push([new Date(dateTime), parseFloat(value)]);
  });

  // Regroup the series using the short measure parameter e.g. `level`, `flow`.
  const categories: Record<string, StationDataSeries[]> = {};
  Object.entries(series).forEach(([key, data]) => {
    const measure = parseMeasureId(key);
    categories[measure.parameter] = categories[measure.parameter] || [];
    categories[measure.parameter].push({ measure, data });
  });

  // Sort each of the series in each of the categories.
  const { ascending, descending } = options;
  if (ascending || descending) {
    // Note that subtract works for Dates as well as numbers.
    // Avoid fighting Typescript here.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    const compare = ascending ? ([a], [b]) => a - b : ([a], [b]) => b - a;
    Object.values(categories).forEach((series) => {
      series.forEach((entry) => {
        // Avoid fighting Typescript here.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        entry.data.sort(compare);
      });
    });
  }
  return categories;
};

export const fetchStation = async (
  id: string
): Promise<[Record<string, unknown>, Response]> => {
  const response = await request(`/id/stations/${id}`);
  const data = <ApiItemResponseData>await response.json();
  return [parseStationResponse(data), response];
};

const stationDataDefaults: StationDataOptions = {
  limit: 1000,
};

export const fetchStationData = async (
  id: string,
  options: StationDataOptions = {}
): Promise<[Record<string, StationDataSeries[]>, Response]> => {
  const settings = { ...stationDataDefaults, ...options };
  const { ascending, descending, since, limit: _limit } = settings;
  const params: Record<string, unknown> = { since, _limit };
  if (ascending || descending) {
    params._sorted = true;
  }
  const response = await request(`/id/stations/${id}/readings`, { params });
  const data = <ApiCollectionResponseData<ApiResponseStationDataItem>>(
    await response.json()
  );
  return [parseStationDataResponse(data, { ascending, descending }), response];
};
