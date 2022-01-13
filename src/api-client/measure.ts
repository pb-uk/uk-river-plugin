/**
 * Measures API.
 */
import { stripPath } from './utils';

//
const measureIdRegex = /([^-]*)-(([^-]*)-([^-]*))-([^-]*-[^-]*)-([^-]*)/;

/**
 * Parse a measure id into usable parts.
 *
 * @param id The id for a measure, with or without URL path.
 * @returns The parts of the id.
 */
export const parseMeasureId = (id: string) => {
  const identifier = stripPath(id);
  const [
    ,
    station,
    qualifiedParameter,
    parameter,
    qualifier,
    interval,
    unitName,
  ] = identifier.match(measureIdRegex) || [];
  return {
    identifier,
    station,
    qualifiedParameter,
    parameter,
    qualifier,
    interval,
    unitName,
  };
};
