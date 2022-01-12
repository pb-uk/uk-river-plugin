const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

/**
 * Useful errors for the fetch API.
 *
 * err.name is set to the following:
 * - NetworkError: probably a CORS failure.
 * - ApiError: something else.
 */
export class ApiError extends Error {
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

export const request = async (path, settings = {}) => {
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
