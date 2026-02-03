import React, { useEffect, useRef } from 'react';

// Declaration for the global TradingView object
declare global {
  interface Window {
    TradingView: any;
  }
}

interface MarketChartProps {
  supportLevel?: number;
  resistanceLevel?: number;
}

const MarketChart: React.FC<MarketChartProps> = ({ supportLevel, resistanceLevel }) => {
  const containerId = "tradingview_widget_xauusd";
  const initialized = useRef(false);

  useEffect(() => {
    // Avoid re-initializing if already done
    if (initialized.current) return;
    initialized.current = true;

    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: "OANDA:XAUUSD",
          interval: "60", // Default to 1 Hour
          timezone: "Asia/Ho_Chi_Minh",
          theme: "dark",
          style: "1", // Candles
          locale: "vi_VN",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
          studies: [
            "RSI@tv-basicstudies", // RSI
            "BB@tv-basicstudies",  // Bollinger Bands
            "MACD@tv-basicstudies",
            "Stochastic@tv-basicstudies"
          ],
          withdateranges: true,
          hide_volume: true
        });
      }
    };

    // Check if script is already present
    if (document.getElementById('tradingview-widget-script')) {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-[500px] md:h-[650px] bg-slate-900/40 rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
       {/* Header Info Layer - AI Levels Overlay */}
       <div className="flex flex-wrap gap-4 px-5 py-4 bg-slate-900/40 border-b border-slate-800/50 justify-between items-center z-10 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Real-time Technical Chart
          </h3>
          
          <div className="flex gap-4 text-xs font-mono">
             {supportLevel && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="text-emerald-500 font-bold uppercase tracking-wider">Hỗ trợ</span>
                  <span className="text-emerald-300 font-bold">${supportLevel}</span>
                </div>
             )}
             {resistanceLevel && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <span className="text-rose-500 font-bold uppercase tracking-wider">Kháng cự</span>
                  <span className="text-rose-300 font-bold">${resistanceLevel}</span>
                </div>
             )}
          </div>
       </div>

      <div className="flex-1 relative w-full bg-slate-950">
        <div id={containerId} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default MarketChart;
