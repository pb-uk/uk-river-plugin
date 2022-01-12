import { stripPath } from './utils';

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
