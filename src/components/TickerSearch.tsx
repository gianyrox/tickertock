'use client';

import { useState, useEffect, useRef } from 'react';
import { searchTickers, SearchResult } from '@/lib/finnhub';
import { getRemainingRequests } from '@/lib/config';

interface TickerSearchProps {
  onSelectTicker: (ticker: string) => void;
  existingTickers: string[];
}

export default function TickerSearch({ onSelectTicker, existingTickers }: TickerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicks outside the dropdown to close it
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Check if we have enough requests left
        const remainingRequests = getRemainingRequests();
        if (remainingRequests < 5) {
          setError(`API rate limit approaching (${remainingRequests} left). Try again soon.`);
          setLoading(false);
          return;
        }

        const searchResults = await searchTickers(query);
        
        // Filter out tickers that are already selected
        const filteredResults = searchResults.filter(
          result => !existingTickers.includes(result.symbol)
        );
        
        setResults(filteredResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching tickers:', error);
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce searches to prevent API overload

    return () => clearTimeout(debounceTimer);
  }, [query, existingTickers]);

  const handleSelectTicker = (symbol: string) => {
    onSelectTicker(symbol);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a ticker symbol..."
          style={{
            width: '100%',
            padding: '0.75rem',
            paddingLeft: '2.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontSize: '1rem',
          }}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        <div style={{
          position: 'absolute',
          left: '0.75rem',
          pointerEvents: 'none',
          color: 'var(--dark-gray)',
        }}>
          🔍
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#ffecec',
          color: '#e74c3c',
          borderRadius: '4px',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'var(--light-gray)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          Searching...
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            marginTop: '0.25rem',
            zIndex: 10,
          }}
        >
          {results.map((result) => (
            <div
              key={result.symbol}
              onClick={() => handleSelectTicker(result.symbol)}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--light-gray)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{result.symbol}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--dark-gray)' }}>
                  {result.description}
                </div>
              </div>
              <div style={{
                backgroundColor: 'var(--secondary-color-light)',
                color: 'var(--secondary-color)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
              }}>
                {result.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && !error && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            marginTop: '0.25rem',
            padding: '0.75rem',
            textAlign: 'center',
            color: 'var(--dark-gray)',
            zIndex: 10,
          }}
        >
          No results found for "{query}"
        </div>
      )}
    </div>
  );
} 