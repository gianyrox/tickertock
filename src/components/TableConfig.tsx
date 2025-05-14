'use client';

import { useState } from 'react';

interface Column {
  id: string;
  label: string;
  selected: boolean;
  category?: string;
}

interface TableConfigProps {
  columns: Column[];
  onUpdateColumn: (columnId: string, selected: boolean) => void;
}

export default function TableConfig({ columns, onUpdateColumn }: TableConfigProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'core': true,
    'ohlc': false,
    'volume': true,
    'change': true,
    'time-series': false
  });

  // Group columns by category
  const columnsByCategory: Record<string, Column[]> = {};
  
  columns.forEach(column => {
    const category = column.category || 'other';
    if (!columnsByCategory[category]) {
      columnsByCategory[category] = [];
    }
    columnsByCategory[category].push(column);
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Get friendly names for categories
  const getCategoryName = (category: string): string => {
    switch(category) {
      case 'core': return 'Core Data';
      case 'ohlc': return 'OHLC Data';
      case 'volume': return 'Volume Data';
      case 'change': return 'Change Data';
      case 'time-series': return 'Time Series Data';
      default: return 'Other Data';
    }
  };

  // Sort categories in a logical order
  const sortedCategories = ['core', 'change', 'volume', 'ohlc', 'time-series', 'other'].filter(
    category => columnsByCategory[category]
  );

  return (
    <div style={{
      backgroundColor: 'var(--light-gray)',
      padding: '1rem',
      borderRadius: '4px'
    }}>
      <h3 style={{ marginBottom: '1rem' }}>Configure Table Columns</h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {sortedCategories.map(category => (
          <div key={category} style={{ marginBottom: '0.5rem' }}>
            <button 
              onClick={() => toggleCategory(category)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0.5rem',
                width: '100%',
                textAlign: 'left',
                fontWeight: 'bold',
                marginBottom: '0.25rem',
                fontSize: '1rem',
                borderBottom: '1px solid var(--medium-gray)',
                paddingBottom: '0.5rem'
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>
                {expandedCategories[category] ? '▼' : '►'} 
              </span>
              {getCategoryName(category)}
            </button>
            
            {expandedCategories[category] && (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingLeft: '1rem'
              }}>
                {columnsByCategory[category].map(column => (
                  <label 
                    key={column.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      backgroundColor: column.selected ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={column.selected}
                      onChange={(e) => onUpdateColumn(column.id, e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: 'var(--dark-gray)',
        padding: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '4px'
      }}>
        <p>Data is provided by Alpha Vantage API. Core data is fetched using the Global Quote endpoint, and time series data is calculated from historical data.</p>
        <p style={{ marginTop: '0.5rem' }}>Select the columns you want to display in the table and export to CSV.</p>
      </div>
    </div>
  );
} 