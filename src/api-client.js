
class ApiError extends Error {
  constructor(err, response) {
    super(err.message);
    this.error = err;
    this.response = response;
  }
};

const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

const request = async (path, settings = {}) => {
  let response;
  const { params } = settings;
  try {
    let url;
    if (params) {
      const query = new URLSearchParams(params).toString();
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

const stripPath = path => path.substring(path.lastIndexOf('/') + 1);

const measureIdRegex = /([^-]*)-(([^-]*)-([^-]*))-([^-]*-[^-]*)-([^-]*)/

export const parseMeasureId = (id) => {
  const [,station, qualifiedParameter, parameter, qualifier, interval, unitName] = stripPath(id).match(measureIdRegex);
  return {station, qualifiedParameter, parameter, qualifier, interval, unitName};
};

const parseStationResponse = (data) => {
  return data.items;
}

const parseStationDataResponse = (data) => {
  /*
    "@id": "http://environment.data.gov.uk/flood-monitoring/data/readings/3400TH-level-stage-i-15_min-mAOD/2021-12-14T00-00-00Z"
​​    dateTime: "2021-12-14T00:00:00Z"
​​​    measure: "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD"
​​​    value: 4.632
  */
  const series = {};
  data.items.forEach(({ measure, dateTime, value }) => {
    series[measure] = series[measure] || [];
    series[measure].push(new Date(dateTime), parseFloat(value));
  });
  const categories = {};
  Object.entries(series).forEach(([key, data]) => {
    const measure = parseMeasureId(key);
    categories[measure.parameter] = categories[measure.parameter] || [];
    categories[measure.parameter].push({ measure, data });
  });
  return categories;
};

export const fetchStation = async (id) => {
  const response = await request(`/id/stations/${id}`);
  return [parseStationResponse(await response.json()), response];
};

export const fetchStationData = async (id, options = {}) => {
  const { since } = options;
  const params = { _sorted: true, since };
  const response = await request(`/id/stations/${id}/readings`, { params });
  return [parseStationDataResponse(await response.json()), response];
};
