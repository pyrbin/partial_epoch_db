const basePath =
  process.env.NODE_ENV === "production" ||
  (typeof window !== "undefined" &&
    window?.location?.hostname.includes("github.io"))
    ? "/partial_epoch_db"
    : "";

/**
 * Get the asset path with proper base path for GitHub Pages deployment
 */
export function getAssetPath(path: string): string {
  return `${basePath}${path}`;
}

/**
 * Get the API path with proper base path for GitHub Pages deployment
 */
export function getApiPath(path: string): string {
  return `${basePath}${path}`;
}
