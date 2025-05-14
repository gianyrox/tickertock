'use client';

import { useState, useRef, useEffect } from 'react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey: string;
}

export default function APIKeyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentKey 
}: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(apiKey);
      onClose();
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div 
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2 style={{ 
          margin: '0 0 16px 0',
          fontSize: '1.5rem',
          color: 'var(--primary-color)'
        }}>
          Finnhub API Key
        </h2>
        
        <p style={{ 
          margin: '0 0 16px 0',
          color: 'var(--dark-gray)',
          lineHeight: '1.5'
        }}>
          Enter your Finnhub API key to use your own account. You can get a free API key from 
          <a 
            href="https://finnhub.io/register" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary-color)',
              textDecoration: 'none',
              margin: '0 4px'
            }}
          >
            Finnhub.io
          </a>
          (free tier allows 60 requests per minute).
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="apiKey"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: 'var(--dark-gray)'
              }}
            >
              API Key
            </label>
            <input 
              ref={inputRef}
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Finnhub API key"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--light-gray)',
                color: 'var(--dark-gray)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKey.trim()}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving || !apiKey.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                opacity: isSaving || !apiKey.trim() ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'var(--light-gray)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: 'var(--dark-gray)',
        }}>
          <strong>Note:</strong> Your API key will be stored locally in your browser. No data is sent to our servers.
        </div>
      </div>
    </div>
  );
} 