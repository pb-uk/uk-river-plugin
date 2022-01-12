import { createSvgElememt  } from "./dom.js";

import { fetchStation, fetchStationData } from "./api-client.js";

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
