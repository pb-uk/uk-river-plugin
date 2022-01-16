import { request } from './request';
import type { ApiResponse } from './request';

import { fetchEntity, putEntity } from './entity';
import type { Entity } from './entity';

/**
 * The type returned by fetchStation.
 */
export type Station = {
  id: string;
  name: string;
};

/**
 * A model of the data received from the server.
 */
type StationResponseData = {
  items: {
    label: string;
    stationReference: string;
  };
};

/**
 * Transform the data returned from the server into a Server object.
 *
 * @param data The data from the server.
 * @returns The corresponding Station object.
 */
const parseStationResponse = (data: StationResponseData): Station => {
  const { items } = data;
  return {
    id: items.stationReference,
    name: items.label,
  };
};

/**
 * Fetch a station from the server.
 *
 * If the station is not found an ApiError is thrown from request().
 *
 * @param id The id (station reference) of the station.
 * @returns The corresponding Station object.
 */
export const fetchStation = async (id: string): Promise<Entity<Station>> => {
  // Try the entity from the cache.
  let entity = <Entity<Station>>await fetchEntity(`station/${id}`);
  // If the entity is stale or does not exist:
  const [data, response] = await fetchStationResponse(id);
  const station = parseStationResponse(data);
  entity = <Entity<Station>>await putEntity(`station/${id}`, station, response);
  return entity;
};

/**
 * Fetch a station from the server.
 *
 * If the station is not found an ApiError is thrown from request().
 *
 * @param id The id (station reference) of the station.
 * @returns The corresponding Station object.
 */
export const fetchStationResponse = async (
  id: string
): Promise<ApiResponse<StationResponseData>> => {
  const response = await request(`/id/stations/${id}`);
  const data = <StationResponseData>await response.json();
  return [data, response];
};
