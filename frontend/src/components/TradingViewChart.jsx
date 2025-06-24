import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol = 'BTCUSD' }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Check if TradingView script is already loaded
    if (window.TradingView) {
      createWidget();
      return;
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        createWidget();
      }
    };
    script.onerror = () => {
      console.error('Failed to load TradingView script');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.error('Error removing TradingView widget:', error);
        }
      }
    };
  }, [symbol]);

  const createWidget = () => {
    if (!containerRef.current || !window.TradingView) return;

    try {
      // Clear previous widget
      if (widgetRef.current) {
        widgetRef.current.remove();
      }

      // Create new widget
      widgetRef.current = new window.TradingView.widget({
        autosize: false,
        symbol: `BINANCE:${symbol}`,
        interval: '60',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        container_id: containerRef.current.id,
        width: '100%',
        height: 500,
      });
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }
  };

  return (
    <div className="my-4">
      <div 
        ref={containerRef}
        id={`tv_chart_${symbol}`} 
        style={{ height: 700, width: '100%' }} 
      />
    </div>
  );
};

export default TradingViewChart; 