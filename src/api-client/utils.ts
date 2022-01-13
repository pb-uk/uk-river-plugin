/**
 * Utility functions.
 */

/**
 * Strip the path from a URL or similar path.
 *
 * @param path a URL or other path with `/` delimiters.
 * @returns Everything after the last `/`.
 */
export const stripPath = (path: string) =>
  path.substring(path.lastIndexOf('/') + 1);
