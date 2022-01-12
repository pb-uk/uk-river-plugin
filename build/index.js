(function () {
  'use strict';

  const createSvgElememt = (name = 'svg', attrs = {}) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  };

  class ApiError extends Error {
    constructor(err, response) {
      super(err.message);
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

  const measureIdRegex = /([^-]*)-(([^-]*)-([^-]*))-([^-]*-[^-]*)-([^-]*)/;

  const parseMeasureId = (id) => {
    const [,station, qualifiedParameter, parameter, qualifier, interval, unitName] = stripPath(id).match(measureIdRegex);
    return {station, qualifiedParameter, parameter, qualifier, interval, unitName};
  };

  const parseStationResponse = (data) => {
    return data.items;
  };

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

  const fetchStation = async (id) => {
    const response = await request(`/id/stations/${id}`);
    return [parseStationResponse(await response.json()), response];
  };

  const fetchStationData = async (id, options = {}) => {
    const { since } = options;
    const params = { _sorted: true, since };
    const response = await request(`/id/stations/${id}/readings`, { params });
    return [parseStationDataResponse(await response.json()), response];
  };

  const plot = (data) => {
    const svg = createSvgElememt('svg', { viewBox: '0 0 100 100'});
    console.log(data);
    const d = 'M0,0L50,50';

    svg.append(createSvgElememt('path', {
      fill: 'lightblue',
      stroke: 'blue',
      d,
    }));
    document.getElementById('app').append(svg);
  };

  const showPlot = async (id) => {
    const since = new Date(Date.now() - 86400 * 1000 * 3).toISOString();
    const [data] = await fetchStationData(id, { since });
    plot(data);
  };

  const showStation = async (id) => {
    const [station] = await fetchStation(id);
    document.getElementById('app').prepend(`${station.label}`);
  };

  showStation('3400TH');
  showPlot('3400TH');

})();
