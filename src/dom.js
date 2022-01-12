
export const setDomElement = (el, html) => {
  el.innerHTML = html;
};

export const setDomId = (id, html) => {
  setDomElement(document.getElementById(id), html);
};

export const createDomElememt = (name, attrs = {}) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
};

export const createSvgElememt = (name = 'svg', attrs = {}) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
};
