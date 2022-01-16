/**
 * Convenience method to interpret an argument representing a DOM element as
 * either a string or the element itself.
 *
 * @param el A query selector string
 * @returns The element or if the query fails, the root `<html>` element.
 */
export const getElement = (el: Element | string): Element => {
  if (typeof el !== 'string') {
    return el;
  }
  return document.querySelector(el) ?? document.documentElement;
};

/**
 * Simple transformation from camelCase to kebab-case.
 *
 * Doesn't deal with any edge cases, input should only contain [A-Za-z].
 *
 * @param camelCaseString aStringInCamelCase.
 * @returns the-string-in-kebab-case.
 */
export const kebabCase = (camel: string): string => {
  return camel.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

const getSafeAttributeValue = (value: unknown): string | null => {
  switch (typeof value) {
    case 'string':
      return value;
    // These can be safely converted to strings.
    case 'number':
    case 'bigint':
      return `${value}`;
    // Ignore `false` but treat `true` as an empty string.
    case 'boolean':
      return value === true ? '' : null;
    // Ignore anything else.
    default:
      return null;
  }
};

/**
 * Set attributes on a DOM element.
 *
 * Note this works on HTML or SVG elements **but not for attributes in other
 * namespaces** e.g. `xlink:href`, `xml:lang`.
 *
 * @param el A DOM element.
 * @param attrs A { name: value } object of attributes.
 */
export const setAttributes = (
  el: Element,
  attrs: Record<string, unknown>
): void => {
  Object.entries(attrs).forEach(([key, value]) => {
    const safeValue = getSafeAttributeValue(value);
    if (safeValue === null) return;
    el.setAttribute(kebabCase(key), safeValue);
  });
};

export const createHtmlElememt = (name: string, attrs = {}) => {
  const el = document.createElement(name);
  setAttributes(el, attrs);
  return el;
};

export const createSvgElememt = (name = 'svg', attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  setAttributes(el, attrs);
  return el;
};
