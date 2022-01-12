/**
 * Useful errors for the fetch API.
 *
 * err.name is set to the following:
 * - NetworkError: probably a CORS failure.
 * - ApiError: something else.
 */
class ApiError extends Error {
  constructor(err, response) {
    if (err.name === 'TypeError') {
      super('Error fetching resource');
      this.name = 'NetworkError';
    } else {
      super(err.message);
      this.name = 'ApiError';
    }
    this.error = err;
    this.response = response;
  }
}

const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

const request = async (path, settings = {}) => {
  let response;
  const { params } = settings;
  try {
    let url;
    if (params) {
      const filtered = {};
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          filtered[key] = value;
        }
      });
      const query = new URLSearchParams(filtered).toString();
      url = `${baseUrl}${path}?${query}`;
    } else {
      url = `${baseUrl}${path}`;
    }
    response = await fetch(url);
  } catch (err) {
    throw new ApiError(err, response);
  }
  if (!response?.ok) {
    throw new ApiError(new Error('Response not OK'), response);
  }
  return response;
};

const stripPath = (path) => path.substring(path.lastIndexOf('/') + 1);

const measureIdRegex = /([^-]*)-(([^-]*)-([^-]*))-([^-]*-[^-]*)-([^-]*)/;

export const parseMeasureId = (id) => {
  const [
    ,
    station,
    qualifiedParameter,
    parameter,
    qualifier,
    interval,
    unitName,
  ] = stripPath(id).match(measureIdRegex);
  return {
    station,
    qualifiedParameter,
    parameter,
    qualifier,
    interval,
    unitName,
  };
};

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
