export const setDomElement = (el: HTMLElement, html: string) => {
  el.innerHTML = html;
};

export const setDomId = (id: string, html: string) => {
  const el = document.getElementById(id);
  if (el) setDomElement(el, html);
};

export const createDomElememt = (name: string, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, <string>value);
  });
};

export const createSvgElememt = (name = 'svg', attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, <string>value);
  });
  return el;
};
