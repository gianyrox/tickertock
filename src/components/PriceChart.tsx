'use client';

import { useEffect, useRef } from 'react';
import { HistoricalDataPoint } from '@/lib/finnhub';

interface PriceChartProps {
  data: HistoricalDataPoint[];
  ticker: string;
  timeRange: string;
}

export default function PriceChart({ data, ticker, timeRange }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    // Clear previous content
    chartRef.current.innerHTML = '';
    chartRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make sure the canvas is properly scaled
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Sort data chronologically to ensure proper display
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Extract only the close prices
    const prices = sortedData.map(item => item.close);
    
    // Find min and max for scaling
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Add a small buffer for better visualization
    const topBuffer = priceRange * 0.1;
    const bottomBuffer = priceRange * 0.1;
    const effectiveMin = minPrice - bottomBuffer;
    const effectiveMax = maxPrice + topBuffer;
    const effectiveRange = effectiveMax - effectiveMin;

    // Calculate starting price and ending price for color determination
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const isPositive = endPrice >= startPrice;
    
    // Set chart colors
    const chartColor = isPositive ? 'var(--secondary-color)' : '#e74c3c';
    const gradientTopColor = isPositive ? 'rgba(56, 178, 172, 0.2)' : 'rgba(231, 76, 60, 0.2)';
    const gradientBottomColor = isPositive ? 'rgba(56, 178, 172, 0)' : 'rgba(231, 76, 60, 0)';

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, gradientTopColor);
    gradient.addColorStop(1, gradientBottomColor);

    // Draw chart
    const drawChart = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Start the path for the price line
      ctx.beginPath();
      ctx.moveTo(0, rect.height - ((prices[0] - effectiveMin) / effectiveRange) * rect.height);
      
      // Draw price line
      for (let i = 1; i < prices.length; i++) {
        const x = (i / (prices.length - 1)) * rect.width;
        const y = rect.height - ((prices[i] - effectiveMin) / effectiveRange) * rect.height;
        ctx.lineTo(x, y);
      }
      
      // Style and stroke the line
      ctx.strokeStyle = chartColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Fill the area under the line
      ctx.lineTo(rect.width, rect.height);
      ctx.lineTo(0, rect.height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Optionally, draw the ending price near the right side of the chart
      const endPriceY = rect.height - ((endPrice - effectiveMin) / effectiveRange) * rect.height;
      const percentChange = ((endPrice - startPrice) / startPrice) * 100;
      const priceText = `$${endPrice.toFixed(2)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)`;
      
      // Add a label for the percentage change
      if (rect.width > 120) { // Only draw text if there's enough space
        ctx.font = '10px Arial';
        ctx.fillStyle = chartColor;
        ctx.textAlign = 'right';
        ctx.fillText(priceText, rect.width - 5, endPriceY - 5);
      }
    };
    
    // Draw the chart
    drawChart();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawChart();
    });
    
    resizeObserver.observe(chartRef.current);
    
    // Cleanup
    return () => {
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [data, ticker, timeRange]);

  return (
    <div
      ref={chartRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '60px',
      }}
    >
      {!data || data.length === 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'var(--medium-gray)',
        }}>
          No data
        </div>
      )}
    </div>
  );
} 