// Alpha Vantage API client

// API constants
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const BASE_URL = process.env.ALPHAVANTAGE_BASE_URL;

export interface StockData {
  // Core data (always available)
  symbol: string;
  price: number;  // 05. price from Global Quote
  
  // Price changes (from Global Quote)
  change: number;  // 09. change
  changePercent: number;  // 10. change percent
  
  // OHLCV data (from Global Quote)
  open: number;  // 02. open
  high: number;  // 03. high
  low: number;  // 04. low
  close: number; // 08. previous close
  volume: number; // 06. volume
  
  // Additional market data
  latestTradingDay?: string; // 07. latest trading day
  
  // Time-series calculated changes
  change24h?: number;
  changePercent24h?: number;
  change7d?: number;
  changePercent7d?: number;
  change30d?: number;
  changePercent30d?: number;
  change1y?: number;
  changePercent1y?: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

// Get current quote data for a ticker
export async function getQuote(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message'] || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      console.error('Error fetching quote:', data);
      return null;
    }
    
    const quote = data['Global Quote'];
    
    // Extract all available fields from the Global Quote response
    return {
      symbol: quote['01. symbol'] || symbol,
      price: parseFloat(quote['05. price']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      close: parseFloat(quote['08. previous close']),
      volume: parseInt(quote['06. volume'], 10),
      latestTradingDay: quote['07. latest trading day'],
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

// Get historical time series data for a ticker
export async function getHistoricalData(symbol: string, timeRange: string): Promise<HistoricalDataPoint[]> {
  let function_name = 'TIME_SERIES_DAILY';
  let dataKey = 'Time Series (Daily)';
  
  // Map time range to appropriate API function
  switch(timeRange) {
    case '1D':
      function_name = 'TIME_SERIES_INTRADAY';
      dataKey = 'Time Series (5min)';
      break;
    case '1W':
    case '1M':
      function_name = 'TIME_SERIES_DAILY';
      dataKey = 'Time Series (Daily)';
      break;
    case '3M':
      function_name = 'TIME_SERIES_WEEKLY';
      dataKey = 'Weekly Time Series';
      break;
    case '1Y':
      function_name = 'TIME_SERIES_MONTHLY';
      dataKey = 'Monthly Time Series';
      break;
    default:
      function_name = 'TIME_SERIES_DAILY';
      dataKey = 'Time Series (Daily)';
  }
  
  try {
    let url = `${BASE_URL}?function=${function_name}&symbol=${symbol}&apikey=${API_KEY}`;
    
    // Add interval parameter for intraday data
    if (function_name === 'TIME_SERIES_INTRADAY') {
      url += '&interval=5min';
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data['Error Message'] || !data[dataKey]) {
      console.error('Error fetching historical data:', data);
      return [];
    }
    
    const timeSeries = data[dataKey];
    const result: HistoricalDataPoint[] = [];
    
    // Convert data to array format
    for (const date in timeSeries) {
      const entry = timeSeries[date];
      result.push({
        date,
        price: parseFloat(entry['4. close']),
      });
    }
    
    // Sort by date ascending
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter based on time range
    let filteredResult = result;
    const now = new Date();
    
    switch(timeRange) {
      case '1D':
        // Last day of data
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(now.getDate() - 1);
        filteredResult = result.filter(item => new Date(item.date) >= oneDayAgo);
        break;
      case '1W':
        // Last 7 days of data
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        filteredResult = result.filter(item => new Date(item.date) >= oneWeekAgo);
        break;
      case '1M':
        // Last 30 days of data
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setDate(now.getDate() - 30);
        filteredResult = result.filter(item => new Date(item.date) >= oneMonthAgo);
        break;
      case '3M':
        // Last 90 days of data
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setDate(now.getDate() - 90);
        filteredResult = result.filter(item => new Date(item.date) >= threeMonthsAgo);
        break;
      case '1Y':
        // Last 365 days of data
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        filteredResult = result.filter(item => new Date(item.date) >= oneYearAgo);
        break;
    }
    
    return filteredResult;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

// Calculate price changes over different time periods
export async function calculatePriceChanges(symbol: string): Promise<Partial<StockData>> {
  try {
    // Get historical data for 1 year (we'll extract different periods from this)
    const yearlyData = await getHistoricalData(symbol, '1Y');
    
    if (yearlyData.length === 0) {
      return {};
    }
    
    // Current price is the most recent close
    const currentPrice = yearlyData[yearlyData.length - 1].price;
    
    // Calculate changes for different periods
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Find closest data points to each time period
    const dayData = findClosestDataPoint(yearlyData, oneDayAgo);
    const weekData = findClosestDataPoint(yearlyData, oneWeekAgo);
    const monthData = findClosestDataPoint(yearlyData, oneMonthAgo);
    const yearData = findClosestDataPoint(yearlyData, oneYearAgo);
    
    // Calculate changes
    const changes: Partial<StockData> = {};
    
    if (dayData) {
      changes.change24h = currentPrice - dayData.price;
      changes.changePercent24h = (changes.change24h / dayData.price) * 100;
    }
    
    if (weekData) {
      changes.change7d = currentPrice - weekData.price;
      changes.changePercent7d = (changes.change7d / weekData.price) * 100;
    }
    
    if (monthData) {
      changes.change30d = currentPrice - monthData.price;
      changes.changePercent30d = (changes.change30d / monthData.price) * 100;
    }
    
    if (yearData) {
      changes.change1y = currentPrice - yearData.price;
      changes.changePercent1y = (changes.change1y / yearData.price) * 100;
    }
    
    return changes;
  } catch (error) {
    console.error('Error calculating price changes:', error);
    return {};
  }
}

// Helper function to find the closest data point to a target date
function findClosestDataPoint(data: HistoricalDataPoint[], targetDate: Date): HistoricalDataPoint | null {
  if (data.length === 0) return null;
  
  let closest = data[0];
  let closestDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime());
  
  for (const point of data) {
    const diff = Math.abs(new Date(point.date).getTime() - targetDate.getTime());
    if (diff < closestDiff) {
      closest = point;
      closestDiff = diff;
    }
  }
  
  return closest;
}

// Search for tickers
export async function searchTickers(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message'] || !data['bestMatches']) {
      console.error('Error searching tickers:', data);
      return [];
    }
    
    return data['bestMatches'].map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
    }));
  } catch (error) {
    console.error('Error searching tickers:', error);
    return [];
  }
} 