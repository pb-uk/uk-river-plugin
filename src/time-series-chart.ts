import { getElement, createSvgElememt } from './dom';

type TimeSeriesChartOptions = {
  el?: HTMLElement | string;
};

type TimeSeriesChartSeries = {
  data: [Date, number][];
};

type PlotLineOptions = {
  color?: string;
};

const lineDefaults: PlotLineOptions = {
  color: 'rgba(75, 75, 100, 0.75)',
};

const getTimeSeriesRanges = (data: [Date, number][]) => {
  let minValue = Number.POSITIVE_INFINITY;
  let maxValue = Number.NEGATIVE_INFINITY;
  let minTime = minValue;
  let maxTime = maxValue;

  let date: Date;
  let value: number;

  for (let i = 0; i < data.length; ++i) {
    [date, value] = data[i];
    minTime = Math.min(minTime, date.valueOf());
    maxTime = Math.max(maxTime, date.valueOf());
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  }
  return [minTime, maxTime, minValue, maxValue];
};

class TimeSeriesChart {
  rootElement: SVGElement;
  settings: TimeSeriesChartOptions;
  plotDimensions: [number, number];
  viewBoxDimensions: [number, number] = [200, 200];
  plotMargins: [number, number, number, number] = [20, 30, 40, 50];

  constructor(el: HTMLElement | string, options: TimeSeriesChartOptions = {}) {
    this.settings = { ...options };

    // Create and insert the root element.
    const [w, h] = this.viewBoxDimensions;
    this.rootElement = createSvgElememt('svg', {
      style: 'background: #eee; margin: auto;',
    });
    // viewBox must be set separately because createSvgElement kebab-cases
    // attributes.
    this.rootElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.setParentElement(el);
    // Calculate the plot dimensions.
    this.plotDimensions = this.updatePlotDimensions();
  }

  // render(HtmlElement)
  addSeries(series: TimeSeriesChartSeries): this {
    const settings = lineDefaults;
    // Get the x and y axis ranges.
    const [tMin, tMax, vMin, vMax] = getTimeSeriesRanges(series.data);
    const [plotWidth, plotHeight] = this.plotDimensions;

    // Get the x and y axis scales and offsets.
    const kx = plotWidth / (tMax - tMin);
    const ky = plotHeight / (vMax - vMin);
    const [top, , , x0] = this.plotMargins;
    const y0 = top - plotHeight;

    // Get the first point and plot it.
    let [date, v] = series.data[0];
    let t = date.valueOf();
    const parts = [`M${x0 + (t - tMin) * kx},${y0 + (v - vMin) * ky}`];
    for (let i = 1; i < series.data.length; ++i) {
      [date, v] = series.data[i];
      t = date.valueOf();
      parts.push(`L${x0 + (t - tMin) * kx},${y0 + (v - vMin) * ky}`);
    }

    this.rootElement.append(
      createSvgElememt('path', {
        stroke: settings.color,
        strokeOpacity: 0.75,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
        fillOpacity: 0.75,
        d: parts.join(''),
      })
    );
    console.log(parts);
    return this;
  }

  setParentElement(parent: HTMLElement | string) {
    getElement(parent).append(this.rootElement);
  }

  updatePlotDimensions() {
    const [vbw, vbh] = this.viewBoxDimensions;
    const [mt, mr, mb, ml] = this.plotMargins;
    return (this.plotDimensions = [vbw - ml - mr, mt + mb - vbh]);
  }
}

export const createTimeSeriesChart = (
  el: HTMLElement | string,
  options?: TimeSeriesChartOptions
) => new TimeSeriesChart(el, options);
