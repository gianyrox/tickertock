'use client';

import { useEffect, useState } from 'react';
import PriceChart from './PriceChart';
import { 
  getQuote, 
  getHistoricalData, 
  calculatePriceChanges, 
  StockData, 
  HistoricalDataPoint 
} from '@/lib/finnhub';
import { requestCount, getRemainingRequests, FINNHUB_API_KEY } from '@/lib/config';

interface Column {
  id: string;
  label: string;
  selected: boolean;
}

interface DataTableProps {
  tickers: string[];
  columns: Column[];
  onRemoveTicker: (ticker: string) => void;
  timeRange: string;
}

type HistoricalData = {
  [key: string]: HistoricalDataPoint[];
};

export default function DataTable({ tickers, columns, onRemoveTicker, timeRange }: DataTableProps) {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [showPriceCharts, setShowPriceCharts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiRequests, setApiRequests] = useState({ total: 0, minute: 0, remaining: 60 });
  
  // Check if using custom API key
  const isUsingCustomKey = FINNHUB_API_KEY !== 'd0hvls1r01qji78qqe90d0hvls1r01qji78qqe9g';

  // Update the API request counter display
  useEffect(() => {
    const interval = setInterval(() => {
      setApiRequests({
        total: requestCount.total,
        minute: requestCount.minute,
        remaining: getRemainingRequests()
      });
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (tickers.length === 0) {
        setData([]);
        setHistoricalData({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Limit batch size to avoid rate limiting
        const batchSize = 5;
        let validTickers: string[] = [];
        let validQuotes: StockData[] = [];
        
        // Process in batches to avoid exceeding rate limits
        for (let i = 0; i < tickers.length; i += batchSize) {
          const batch = tickers.slice(i, i + batchSize);
          
          // Fetch quotes for current batch
          const quotePromises = batch.map(ticker => getQuote(ticker));
          const quotes = await Promise.all(quotePromises);
          
          // Filter out null values
          quotes.forEach((quote, index) => {
            if (quote) {
              validTickers.push(batch[index]);
              validQuotes.push(quote);
            }
          });
          
          // If this isn't the last batch, add a small delay to avoid overwhelming the API
          if (i + batchSize < tickers.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Get additional price changes - we can do this efficiently using our cache
        const changesPromises = validTickers.map(ticker => calculatePriceChanges(ticker));
        const changesResults = await Promise.all(changesPromises);
        
        // Combine quotes with price changes
        const enrichedData = validQuotes.map((quote, index) => ({
          ...quote,
          ...changesResults[index]
        }));
        
        // Fetch historical data for charts - again in batches if necessary
        const newHistoricalData: HistoricalData = {};
        
        for (let i = 0; i < validTickers.length; i += batchSize) {
          const batch = validTickers.slice(i, i + batchSize);
          
          const histPromises = batch.map(ticker => getHistoricalData(ticker, timeRange));
          const historicalResults = await Promise.all(histPromises);
          
          // Add to our historical data map
          batch.forEach((ticker, index) => {
            newHistoricalData[ticker] = historicalResults[index];
          });
          
          // Small delay between batches
          if (i + batchSize < validTickers.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setData(enrichedData);
        setHistoricalData(newHistoricalData);
        
        if (enrichedData.length === 0) {
          setError('No data available for the selected tickers.');
        }
        
        // Update the API request counter
        setApiRequests({
          total: requestCount.total,
          minute: requestCount.minute,
          remaining: getRemainingRequests()
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tickers, timeRange]);

  const formatValue = (value: string | number | undefined, columnId: string) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (typeof value === 'number') {
      if (columnId === 'price' || columnId === 'dayHigh' || columnId === 'dayLow' || columnId === 'dayOpen' || columnId === 'prevClose') {
        return `$${value.toFixed(2)}`;
      } else if (columnId === 'marketCap') {
        return value > 1000000000 
          ? `$${(value / 1000000000).toFixed(2)}B` 
          : `$${(value / 1000000).toFixed(2)}M`;
      } else if (columnId === 'volume') {
        return value > 1000000 
          ? `${(value / 1000000).toFixed(2)}M` 
          : `${value.toLocaleString()}`;
      } else if (columnId.includes('changePercent')) {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      } else if (columnId.includes('change')) {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
      }
    }
    return value;
  };

  const getValueColor = (value: string | number | undefined, columnId: string) => {
    if (value === undefined || value === null) return 'inherit';
    
    if (columnId.includes('change')) {
      if (typeof value === 'number') {
        return value > 0 ? 'var(--secondary-color)' : value < 0 ? '#e74c3c' : 'inherit';
      }
    }
    return 'inherit';
  };

  if (tickers.length === 0) {
    return null;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem' 
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--medium-gray)' }}>
          Data from Finnhub
          <span> • Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: apiRequests.remaining < 10 ? '#e74c3c' : 'var(--dark-gray)',
            backgroundColor: 'var(--light-gray)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span title="API requests in the current minute">
              {apiRequests.minute}/{60}
            </span>
            <span style={{ fontSize: '1.2rem' }}>•</span>
            <span title="Remaining requests for this minute">
              {apiRequests.remaining} left
            </span>
          </div>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            <input 
              type="checkbox" 
              checked={showPriceCharts} 
              onChange={() => setShowPriceCharts(!showPriceCharts)}
              style={{ marginRight: '0.5rem' }}
            />
            Show Charts
          </label>
        </div>
      </div>

      {loading ? (
        <div style={{ 
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--light-gray)',
          borderRadius: '4px'
        }}>
          Loading ticker data...
        </div>
      ) : error ? (
        <div style={{ 
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--light-gray)',
          borderRadius: '4px',
          color: '#e74c3c'
        }}>
          {error}
        </div>
      ) : data.length === 0 ? (
        <div style={{ 
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--light-gray)',
          borderRadius: '4px'
        }}>
          No data available. Try adding some tickers.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              {columns.map(column => (
                <th key={column.id}>{column.label}</th>
              ))}
              {showPriceCharts && 
                <th style={{ width: '200px' }}>Price Chart</th>
              }
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.symbol}>
                <td>
                  <button 
                    onClick={() => onRemoveTicker(row.symbol)}
                    title="Remove ticker"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--dark-gray)',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ×
                  </button>
                </td>
                {columns.map(column => (
                  <td 
                    key={column.id}
                    style={{ 
                      color: getValueColor(row[column.id as keyof StockData], column.id)
                    }}
                  >
                    {formatValue(row[column.id as keyof StockData], column.id)}
                  </td>
                ))}
                {showPriceCharts && (
                  <td style={{ height: '80px', padding: '0.5rem' }}>
                    {historicalData[row.symbol] && historicalData[row.symbol].length > 0 ? (
                      <PriceChart 
                        data={historicalData[row.symbol]} 
                        ticker={row.symbol}
                        timeRange={timeRange}
                      />
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: '100%',
                        color: 'var(--medium-gray)'
                      }}>
                        No chart data available
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div style={{ 
        marginTop: '0.5rem', 
        fontSize: '0.8rem', 
        color: 'var(--medium-gray)',
        textAlign: 'right'
      }}>
        Finnhub API: {apiRequests.total} total requests • Limit: 60 per minute
        {isUsingCustomKey && ' • Using custom API key'}
      </div>
    </div>
  );
} 