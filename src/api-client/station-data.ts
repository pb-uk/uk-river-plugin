import { request } from './request';
import type { ApiResponse } from './request';

import { parseMeasureId } from './measure';

/**
 * The type returned by fetchStationData.
 */
type StationData = {
  [measureType: string]: StationDataSeries[];
};

export type StationDataSeries = {
  measure: Record<string, unknown>;
  data: StationDataItem[];
};

type StationDataItem = [Date, number];

/**
 * A model of the data received from the server.
 */
type StationDataResponseData = {
  items: Array<{
    measure: string;
    dateTime: string;
    value: string;
  }>;
};

/**
 * Options to be provided to fetchStationData.
 */
type StationDataFetchOptions = {
  limit?: number;
  ascending?: boolean;
  descending?: boolean;
  since?: string;
};

/**
 * Transform the data returned from the server into a ServerData object.
 *
 * @param data The data from the server.
 * @returns The corresponding StationData object.
 */
const parseStationDataResponse = (
  data: StationDataResponseData,
  options: StationDataFetchOptions = {}
): StationData => {
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
    // Typescript can't handle the fact that subtraction works for Dates.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    const compare = ascending ? ([a], [b]) => a - b : ([a], [b]) => b - a;
    Object.values(categories).forEach((series) => {
      series.forEach((entry) => {
        // Again we need to avoid fighting Typescript here.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        entry.data.sort(compare);
      });
    });
  }
  return categories;
};

const defaults: StationDataFetchOptions = {
  limit: 1000,
};

export const fetchStationData = async (
  id: string,
  options: StationDataFetchOptions = {}
): Promise<ApiResponse<StationData>> => {
  const settings = { ...defaults, ...options };
  const { ascending, descending, since, limit: _limit } = settings;
  const params: Record<string, unknown> = { since, _limit };
  if (ascending || descending) {
    params._sorted = true;
  }
  const response = await request(`/id/stations/${id}/readings`, { params });
  const data = <StationDataResponseData>await response.json();
  const opts: StationDataFetchOptions = { ascending, descending };
  return [parseStationDataResponse(data, opts), response];
};
