const baseUrl = 'https://environment.data.gov.uk/flood-monitoring';

export type ApiCollectionResponseData<T> = {
  items: T[];
};

export type ApiItemResponseData = {
  items: Record<string, unknown>;
};

/**
 * Useful errors for the fetch API.
 *
 * err.name is set to the following:
 * - NetworkError: probably a CORS failure.
 * - ApiError: something else.
 */
export class ApiError extends Error {
  error: Error;
  response: Response | undefined;

  constructor(err: Error, response?: Response) {
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

export type RequestOptions = {
  params?: Record<string, unknown>;
};

// This needs testing for edge cases.
export const buildQueryString = (params: Record<string, unknown>): string => {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    const safeKey = encodeURIComponent(key);
    // Ignore undefined or null.
    if (value == null) return;
    switch (typeof value) {
      case 'string':
      case 'number':
        parts.push(`${safeKey}=${encodeURIComponent(value)}`);
        return;
      // Avoid any issues with bigint conversions.
      case 'bigint':
        parts.push(`${safeKey}=${encodeURIComponent(value.toString())}`);
        return;
      case 'boolean':
        if (value === true) {
          parts.push(safeKey);
        }
        return;
      default:
        throw new TypeError('Invalid query parameter');
    }
  });
  if (parts.length) {
    return `?${parts.join('&')}`;
  }
  return '';
};

export const request = async (path: string, settings: RequestOptions = {}) => {
  let response: Response | undefined;
  const { params } = settings;
  try {
    const url = params
      ? `${baseUrl}${path}${buildQueryString(params)}`
      : `${baseUrl}${path}`;
    response = await fetch(url);
  } catch (err) {
    throw new ApiError(<Error>err, response);
  }
  if (!response?.ok) {
    throw new ApiError(new Error('Response not OK'), response);
  }
  return response;
};
