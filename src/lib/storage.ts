// Constants for localStorage keys
const STORAGE_KEYS = {
  API_KEY: 'tickertock_finnhub_api_key',
};

/**
 * Saves the Finnhub API key to localStorage
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }
}

/**
 * Retrieves the Finnhub API key from localStorage
 * @returns The stored API key or null if not found
 */
export function getStoredApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }
  return null;
}

/**
 * Clears the stored Finnhub API key from localStorage
 */
export function clearApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}

/**
 * Checks if an API key is already stored
 */
export function hasStoredApiKey(): boolean {
  return !!getStoredApiKey();
} 