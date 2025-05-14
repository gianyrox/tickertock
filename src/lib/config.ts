// Finnhub API Configuration

// API Usage Notes:
// - Free tier: 60 API requests per minute
// - For higher limits, check https://finnhub.io/pricing

// Base URL for Finnhub API
export const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Default API key - will be used if no custom key is provided
const DEFAULT_API_KEY = 'd0hvls1r01qji78qqe90d0hvls1r01qji78qqe9g';

// Get the active API key (custom key from localStorage or default)
export function getApiKey(): string {
  // Check if we're in the browser environment
  if (typeof window !== 'undefined') {
    // Try to get API key from localStorage
    const storedKey = localStorage.getItem('tickertock_finnhub_api_key');
    if (storedKey) {
      return storedKey;
    }
  }
  // Default to the demo key for server-side rendering or if no stored key
  return DEFAULT_API_KEY;
}

// API key for use in client-side code
export let FINNHUB_API_KEY = getApiKey();

// Function to update the API key at runtime
export function updateApiKey(newKey: string): void {
  FINNHUB_API_KEY = newKey || DEFAULT_API_KEY;
  
  // Store in localStorage if in browser
  if (typeof window !== 'undefined') {
    if (newKey) {
      localStorage.setItem('tickertock_finnhub_api_key', newKey);
    } else {
      localStorage.removeItem('tickertock_finnhub_api_key');
    }
  }
  
  // Reset request counters when changing API keys
  requestCount.minute = 0;
  requestCount.lastReset = Date.now();
}

// Request tracking
export const requestCount = {
  total: 0,
  minute: 0,
  lastReset: Date.now(),
};

// Track API requests
export function trackRequest(): void {
  requestCount.total += 1;
  requestCount.minute += 1;
  
  // Reset the minute counter if more than a minute has passed
  const now = Date.now();
  if (now - requestCount.lastReset > 60 * 1000) {
    requestCount.minute = 1; // Count the current request
    requestCount.lastReset = now;
  }
}

// Get remaining requests in the current minute
export function getRemainingRequests(): number {
  // Finnhub free tier limit is 60 requests per minute
  return Math.max(0, 60 - requestCount.minute);
} 