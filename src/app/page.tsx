'use client';

import { useState, useEffect } from 'react';
import TickerSearch from '@/components/TickerSearch';
import DataTable from '@/components/DataTable';
import APIKeyModal from '@/components/APIKeyModal';
import { getQuote, calculatePriceChanges, StockData } from '@/lib/finnhub';
import { updateApiKey, getApiKey, FINNHUB_API_KEY } from '@/lib/config';

// Time range options for percent changes
const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'];

export default function Home() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1W');
  const [exportLoading, setExportLoading] = useState(false);
  const [columns, setColumns] = useState([
    { id: 'symbol', label: 'Symbol', selected: true },
    { id: 'price', label: 'Price', selected: true },
    { id: 'change', label: 'Change', selected: true },
    { id: 'changePercent', label: 'Change %', selected: true },
    { id: 'dayHigh', label: 'High', selected: true },
    { id: 'dayLow', label: 'Low', selected: true },
    { id: 'dayOpen', label: 'Open', selected: false },
    { id: 'prevClose', label: 'Prev Close', selected: false },
    { id: 'weekChange', label: 'Week Change', selected: false },
    { id: 'weekChangePercent', label: 'Week %', selected: false },
    { id: 'monthChange', label: 'Month Change', selected: false },
    { id: 'monthChangePercent', label: 'Month %', selected: false },
  ]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState('');

  // Initialize the API key on component mount
  useEffect(() => {
    setCurrentApiKey(getApiKey());
  }, []);

  const addTicker = (ticker: string) => {
    if (!tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
    }
  };

  const removeTicker = (ticker: string) => {
    setTickers(tickers.filter(t => t !== ticker));
  };

  const toggleColumn = (id: string) => {
    setColumns(
      columns.map(col => 
        col.id === id ? { ...col, selected: !col.selected } : col
      )
    );
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const exportToCSV = async () => {
    if (tickers.length === 0) {
      alert('Please add at least one ticker to export');
      return;
    }

    const activeColumns = columns.filter(col => col.selected);
    if (activeColumns.length === 0) {
      alert('Please select at least one column to export');
      return;
    }

    setExportLoading(true);

    try {
      // Fetch real data for CSV export
      const rowPromises = tickers.map(async (ticker) => {
        // Get basic quote data
        const quoteData = await getQuote(ticker);
        if (!quoteData) return null;
        
        // Get additional price changes
        const changes = await calculatePriceChanges(ticker);
        
        // Combine the data
        return {
          ...quoteData,
          ...changes
        };
      });
      
      const rows = (await Promise.all(rowPromises)).filter(row => row !== null) as StockData[];
      
      if (rows.length === 0) {
        alert('No data available for the selected tickers. Please try again later.');
        setExportLoading(false);
        return;
      }

      // Create CSV content
      const headers = activeColumns.map(col => col.label).join(',');
      const csvContent = rows.map(row => 
        activeColumns.map(col => {
          const value = row[col.id as keyof StockData];
          
          // Format numeric values appropriately for CSV
          if (typeof value === 'number') {
            if (col.id.includes('Percent')) {
              return `${value.toFixed(2)}%`;
            } else {
              return value.toFixed(2);
            }
          }
          
          return value !== undefined ? value : 'N/A';
        }).join(',')
      ).join('\n');
      
      const finalCSV = `${headers}\n${csvContent}`;
      
      // Create download link
      const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Tickertock_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSaveApiKey = async (apiKey: string) => {
    // Update the API key
    updateApiKey(apiKey);
    setCurrentApiKey(apiKey);
    
    // Force refresh data with new API key
    // Since updating the API key resets the counters, it's safe to reload data
    return Promise.resolve();
  };

  // Determine if using custom API key
  const isUsingCustomKey = currentApiKey !== 'd0hvls1r01qji78qqe90d0hvls1r01qji78qqe9g';

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            margin: '0', 
            fontSize: '24px',
            color: 'var(--primary-color)'
          }}>
            TickerTock
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: 'var(--medium-gray)',
            fontSize: '14px'
          }}>
            Real-time stock and crypto tracking
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--dark-gray)' }}>Time range:</span>
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--light-gray)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {TIME_RANGES.map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: timeRange === range 
                      ? 'var(--primary-color)' 
                      : 'transparent',
                    color: timeRange === range 
                      ? 'white' 
                      : 'var(--dark-gray)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isUsingCustomKey ? 'var(--secondary-color-light)' : 'var(--light-gray)',
              color: isUsingCustomKey ? 'var(--secondary-color)' : 'var(--dark-gray)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {isUsingCustomKey ? (
              <>
                <span>✓</span>
                <span>Using Custom API Key</span>
              </>
            ) : (
              <>
                <span>🔑</span> 
                <span>Use Your API Key</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main>
        <TickerSearch onSelectTicker={addTicker} existingTickers={tickers} />
        
        <div style={{ marginBottom: '16px' }}>
          <details style={{
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '8px 16px',
            backgroundColor: 'var(--light-gray)',
            fontSize: '14px'
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '4px 0'
            }}>
              Customize Columns
            </summary>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '8px',
              padding: '12px 0'
            }}>
              {columns.map(column => (
                <label
                  key={column.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={column.selected}
                    onChange={() => toggleColumn(column.id)}
                    style={{ marginRight: '8px' }}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </details>
        </div>
        
        <DataTable 
          tickers={tickers} 
          columns={columns.filter(col => col.selected)} 
          onRemoveTicker={removeTicker}
          timeRange={timeRange}
        />
        
        {tickers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'var(--light-gray)',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h2 style={{ 
              margin: '0 0 16px 0',
              color: 'var(--primary-color)',
              fontSize: '20px'
            }}>
              Welcome to TickerTock
            </h2>
            <p style={{ color: 'var(--dark-gray)', margin: '0 0 24px 0' }}>
              Search and add stock or crypto tickers above to start tracking prices.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'BTC/USD', 'ETH/USD'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => addTicker(suggestion)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--dark-gray)'
                  }}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: 'var(--medium-gray)',
        fontSize: '14px'
      }}>
        <p style={{ margin: '8px 0' }}>
          Data provided by <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Finnhub</a>
          {isUsingCustomKey && ' (using your API key)'}
        </p>
        <p style={{ margin: '8px 0' }}>
          TickerTock © {new Date().getFullYear()}
        </p>
      </footer>
      
      <APIKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={currentApiKey}
      />
    </div>
  );
} 