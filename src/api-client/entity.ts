/**
 * All API fetch methods should return this type.
 */

export type Entity<T> = {
  id: string;
  value: T;
};

export const fetchEntity = (id: string): Promise<Entity<unknown>> => {
  return Promise.resolve({ id, value: null });
};

export const putEntity = (
  id: string,
  value: unknown,
  response?: Response
): Promise<Entity<unknown>> => {
  // console.log('Put entity into cache', id, value, response);
  return Promise.resolve({ id, value });
};

/*
): Promise<ApiEntityResponse<Station>> => {
  // Try the entity from the cache.
  let entity = fetchEntity(`station/${id}`);
  // If the entity is stale or does not exist:
  const [data, response] = await fetchStationResponse(id);
  const station = parseStationResponse(data);
  entity = putEntity(`station/${id}`, station, response);
  return [station, entity];
*/
