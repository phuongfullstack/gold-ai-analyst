import React, { useEffect, useState } from 'react';
import PriceCard from './components/PriceCard';
import MarketChart from './components/MarketChart';
import AnalysisPanel from './components/AnalysisPanel';
import LocalGoldTable from './components/LocalGoldTable';
import NewsSection from './components/NewsSection';
import AdvancedTechnicals from './components/AdvancedTechnicals';
import DetailedAnalysis from './components/DetailedAnalysis';
import MarketSnapshot from './components/MarketSnapshot';
import ChatWidget from './components/ChatWidget';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import { fetchMarketAnalysis } from './services/ai';
import {
  fetchWorldAndRates,
  fetchDojiData,
  fetchScrapedData,
  fetchVnAppMobData,
  fetchSjcXmlData
} from './services/marketDataFetcher';
import { MarketData, AnalysisReport } from './types';
import { ANALYSIS_CONSTANTS } from './utils/constants';
import { useToast } from './contexts/ToastContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createChart, ColorType } from 'lightweight-charts';

const INITIAL_MARKET_DATA: MarketData = {
  xauPrice: 0,
  xagPrice: 0,
  dxyValue: 0,
  sjcBuy: 0,
  sjcSell: 0,
  pnjBuy: 0,
  pnjSell: 0,
  btmcBuy: 0,
  btmcSell: 0,
  dojiBuy: 0,
  dojiSell: 0,
  ringGoldBuy: 0,
  ringGoldSell: 0,
  silverBuy: 0,
  silverSell: 0,
  usdVnd: 0,
  spread: 0,
  lastUpdated: '...',
};

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>(INITIAL_MARKET_DATA);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPngGenerating, setIsPngGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);

    const vnAppMobToken = localStorage.getItem("VNAPPMOB_API_KEY");

    // Helper to calculate silver and update state
    const updateMarketState = (partial: Partial<MarketData>) => {
      setMarketData(prev => {
        const newState = { ...prev, ...partial };
        // Recalculate silver if possible
        if (newState.xagPrice > 0 && newState.usdVnd > 0 && (!newState.silverSell || newState.silverSell === 0)) {
           const basePrice = (newState.xagPrice * newState.usdVnd * 1.2057) / 1000000;
           newState.silverBuy = Number((basePrice * 0.95).toFixed(2));
           newState.silverSell = Number((basePrice * 1.10).toFixed(2));
        }

        // Recalculate spread if possible
        if (newState.xauPrice > 0 && newState.usdVnd > 0 && newState.sjcSell > 0) {
           const convertedPrice = (newState.xauPrice * newState.usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000;
           newState.spread = Number((newState.sjcSell - convertedPrice).toFixed(2));
        }

        newState.lastUpdated = new Date().toLocaleTimeString('vi-VN');
        return newState;
      });
    };

    // 1. Parallel Asynchronous Fetching for individual metrics
    const tasks = [
      fetchWorldAndRates().then(updateMarketState),
      fetchSjcXmlData().then(updateMarketState),
      fetchDojiData().then(updateMarketState),
      fetchScrapedData().then(updateMarketState)
    ];

    if (vnAppMobToken) {
      tasks.push(fetchVnAppMobData(vnAppMobToken).then(updateMarketState));
    }

    // 2. AI Analysis in parallel - can take longer
    fetchMarketAnalysis().then(data => {
      setReport(data.report);
      setMarketData(prev => ({ ...prev, ...data.marketData }));

      if (data.report.prediction.includes("Safe Mode")) {
         showToast("Đang chạy ở chế độ Safe Mode (Offline)", "warning");
      } else {
         showToast("Dữ liệu thị trường đã được cập nhật", "success");
      }
    }).catch(err => {
      console.error("AI analysis failed:", err);
      showToast("Không thể tải báo cáo AI.", "error");
    }).finally(() => {
      setLoading(false);
    });

    // We don't necessarily need to await 'tasks' here for the AI to start,
    // but we want them to run as soon as loadData is called.
    Promise.allSettled(tasks);
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      loadData();
    }, ANALYSIS_CONSTANTS.REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  const generateExportContainer = async () => {
    const container = document.createElement('div');
    container.id = 'export-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '-9999px', // Position way off screen
      width: ANALYSIS_CONSTANTS.EXPORT_WINDOW_WIDTH + 'px',
      backgroundColor: '#020617',
      zIndex: '-9999'
    });
    document.body.appendChild(container);

    const mainContent = document.querySelector('.max-w-\\[1600px\\]');
    if (!mainContent) return null;

    const clone = mainContent.cloneNode(true) as HTMLElement;

    // Cleanup clone: Remove interactive elements, buttons, chat widgets, and TV specific items
    // Using broader selectors to ensure absolute cleanup of UI controls
    clone.querySelectorAll('button, .no-export, #chat-widget-container, .tradingview-widget-copyright, .settings-trigger, [role="button"], .fixed.bottom-4').forEach(el => el.remove());

    // Find the TradingView container in the clone.
    // In our app, it's either by ID or inside the MarketChart component's wrapper.
    const tvTarget = clone.querySelector('#tradingview_widget_xauusd');
    const tvWrapper = tvTarget?.closest('.bg-slate-900.rounded-xl') || clone.querySelector('.tradingview-widget-container');

    if (tvWrapper) {
      const chartWrapper = document.createElement('div');
      Object.assign(chartWrapper.style, {
        width: '100%',
        height: '550px',
        background: '#0f172a',
        borderRadius: '24px',
        padding: '30px',
        marginTop: '20px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column'
      });

      const title = document.createElement('h3');
      title.innerText = 'BIỂU ĐỒ DIỄN BIẾN THỊ TRƯỜNG XAU/USD (24 GIỜ QUA)';
      Object.assign(title.style, {
        color: '#eab308',
        fontSize: '16px',
        fontWeight: '900',
        marginBottom: '20px',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase'
      });
      chartWrapper.appendChild(title);
      
      const chartCanvas = document.createElement('div');
      chartCanvas.id = 'export-canvas-target';
      Object.assign(chartCanvas.style, {
        width: '100%',
        flex: '1'
      });
      chartWrapper.appendChild(chartCanvas);

      tvWrapper.replaceWith(chartWrapper);
    }

    container.appendChild(clone);

    // Render the lightweight chart into the cloned target
    const target = container.querySelector('#export-canvas-target') as HTMLElement;
    if (target && report?.chartData) {
      try {
        // Create Legend Overlay in the target container
        const legend = document.createElement('div');
        Object.assign(legend.style, {
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: '10',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '8px',
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#fff',
          border: '1px solid #334155'
        });
        legend.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; background: #eab308; border-radius: 2px;"></div>
            <span style="font-weight: bold;">GOLD (XAU/USD)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 2px; background: #3b82f6;"></div>
            <span style="font-weight: bold;">DXY INDEX</span>
          </div>
        `;
        target.style.position = 'relative';
        target.appendChild(legend);

        // Add Watermark
        const watermark = document.createElement('div');
        Object.assign(watermark.style, {
          position: 'absolute',
          bottom: '50px',
          right: '20px',
          zIndex: '5',
          opacity: '0.1',
          pointerEvents: 'none',
          color: '#fff',
          fontSize: '32px',
          fontWeight: '900',
          letterSpacing: '5px'
        });
        watermark.innerText = 'GOLD AI ANALYST';
        target.appendChild(watermark);

        const chart = createChart(target, {
          width: 1100, // Fixed width for export consistency
          height: 440,
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#94a3b8'
          },
          grid: {
            vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
            horzLines: { color: 'rgba(51, 65, 85, 0.5)' }
          },
          timeScale: {
            borderVisible: false,
            timeVisible: true
          },
          rightPriceScale: {
            borderVisible: false,
          },
        });

        const goldSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });

        const dxySeries = chart.addLineSeries({
          color: '#3b82f6',
          lineWidth: 2,
          priceScaleId: 'left',
          priceFormat: {
            type: 'price',
            precision: 3,
            minMove: 0.001,
          },
        });

        chart.priceScale('left').applyOptions({
          visible: true,
          borderVisible: false,
        });

        // Deduplicate and sort chart points by time
        const seenTimes = new Set();
        const chartPoints = report.chartData
          .map(d => ({
            time: parseInt(d.time) as any,
            gold: d.xau,
            dxy: d.dxy,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close
          }))
          .filter(p => {
            if (seenTimes.has(p.time)) return false;
            seenTimes.add(p.time);
            return true;
          })
          .sort((a, b) => a.time - b.time);

        goldSeries.setData(chartPoints.map(p => ({
          time: p.time,
          open: p.open ?? p.gold,
          high: p.high ?? p.gold + 1,
          low: p.low ?? p.gold - 1,
          close: p.close ?? p.gold
        })));
        dxySeries.setData(chartPoints.map(p => ({ time: p.time, value: p.dxy })));

        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Chart rendering error in export:", err);
      }
    }

    // Increased delay to ensure rendering of canvas, candlestick charts, and complex styles
    await new Promise(r => setTimeout(r, 1200));
    return container;
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    showToast("Đang chuẩn bị báo cáo PDF...", "info");
    try {
      const container = await generateExportContainer();
      if (!container) return;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Gold_AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      document.body.removeChild(container);
    } catch (err) {
      console.error(err);
      const c = document.getElementById('export-container');
      if (c) c.remove();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsPngGenerating(true);
    showToast("Đang tạo ảnh chụp thị trường...", "info");
    try {
      const container = await generateExportContainer();
      if (!container) return;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `Gold_Market_Report_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      document.body.removeChild(container);
    } catch (err) {
      console.error(err);
      const c = document.getElementById('export-container');
      if (c) c.remove();
    } finally {
      setIsPngGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-yellow-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 py-6 md:py-10">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black rounded uppercase tracking-widest">Dữ liệu Trực tuyến</span>
               <span className="text-slate-500 text-sm font-mono tracking-tighter">{marketData?.lastUpdated}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
              <span className="text-yellow-500">GOLD</span> MARKET ANALYST
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Hệ thống Phân tích Vàng Thông minh {ANALYSIS_CONSTANTS.APP_VERSION}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-400 hover:text-white transition-all hover:border-slate-500 active:scale-95"
                title="Cài đặt"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
             </button>
             <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating || isPngGenerating || loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 font-bold text-xs uppercase tracking-widest transition-all hover:border-slate-500 disabled:opacity-30 active:scale-95"
             >
                {isPdfGenerating ? '...' : 'Báo cáo PDF'}
             </button>
             <button
                onClick={handleDownloadPng}
                disabled={isPdfGenerating || isPngGenerating || loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
             >
                {isPngGenerating ? '...' : 'Chụp ảnh'}
             </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-6 mb-10">
          <PriceCard 
            title="XAU/USD Spot" 
            value={marketData.xauPrice > 0 ? `$${marketData.xauPrice.toLocaleString()}` : '...'}
            subValue="Thế giới (Global)"
            color="gold"
            icon={<span>🏆</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="XAG/USD Spot"
            value={marketData.xagPrice > 0 ? `$${marketData.xagPrice.toFixed(2)}` : '...'}
            subValue="Bạc Thế giới"
            color="blue"
            icon={<span>🥈</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="SJC Vietnam" 
            value={marketData.sjcSell > 0 ? `${marketData.sjcSell} tr` : '...'}
            subValue={marketData.sjcBuy > 0 ? `Mua: ${marketData.sjcBuy}` : 'Mua: ...'}
            color="red"
            icon={<span>🇻🇳</span>}
            isLoading={loading}
          />
          <PriceCard
            title="Vàng Nhẫn 9999"
            value={marketData.ringGoldSell > 0 ? `${marketData.ringGoldSell} tr` : '...'}
            subValue={marketData.ringGoldBuy > 0 ? `Mua: ${marketData.ringGoldBuy}` : 'Mua: ...'}
            color="gold"
            icon={<span>💍</span>}
            isLoading={loading}
          />
          <PriceCard
            title="Bạc Trong nước"
            value={marketData.silverSell > 0 ? `${marketData.silverSell} tr` : '...'}
            subValue={marketData.silverBuy > 0 ? `Mua: ${marketData.silverBuy}` : 'Mua: ...'}
            color="blue"
            icon={<span>🌑</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="Premium/Spread" 
            value={marketData.sjcSell > 0 && marketData.spread !== 0 ? `+${marketData.spread.toFixed(2)} tr` : '...'}
            subValue={marketData.sjcSell > 0 ? (marketData.spread > 5 ? "⚠️ Rủi ro cao" : "✅ Ổn định") : "Đang tính toán..."}
            color={marketData.sjcSell > 0 && marketData.spread > 5 ? "red" : "green"}
            icon={<span>📊</span>}
            isLoading={loading}
          />
        </div>

        {/* NEW: Market Snapshot Pulse Section */}
        {report && marketData && <MarketSnapshot report={report} marketData={marketData} />}

        {/* Vietnamese Gold Prices Comparison */}
        <div className="mb-10">
           <LocalGoldTable data={marketData} isLoading={loading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10 mb-10">
          <div className="lg:col-span-3 space-y-10">
            <MarketChart 
               supportLevel={report?.entryPointBuy}
               resistanceLevel={report?.entryPointSell}
            />
            {report && <AdvancedTechnicals signals={report.technicalSignals} />}
          </div>

          <div className="lg:col-span-1 min-h-[600px]">
             {report ? (
               <AnalysisPanel 
                 report={report} 
                 isLoading={loading} 
                 onRefresh={loadData} 
               />
             ) : (
                <div className="h-full bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center text-slate-500 p-10 text-center">
                   <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                   <h3 className="text-white font-black uppercase tracking-widest mb-2">Analyzing Markets...</h3>
                </div>
             )}
          </div>
        </div>

        <div className="mb-12">
          {report && <DetailedAnalysis report={report} />}
          {!report && loading && (
             <div className="h-64 bg-slate-800/40 rounded-2xl border border-slate-700/50 animate-pulse flex items-center justify-center">
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Đang phân tích xu hướng chi tiết...</span>
             </div>
          )}
        </div>

        {/* News Section */}
        <div className="mb-16">
           <NewsSection news={report?.news || []} isLoading={loading} />
        </div>

        {/* Secondary Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/30">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Foreign Exchange</div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold">USD/VND</span>
                  <span className="text-white font-mono font-black">{marketData?.usdVnd.toLocaleString() || '...'} ₫</span>
               </div>
               <div className="flex justify-between items-center text-sm mt-4">
                  <span className="text-slate-400 font-bold">Quy đổi TG</span>
                  <span className="text-yellow-500 font-mono font-black text-lg">
                    {marketData ? ((marketData.xauPrice * marketData.usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000).toFixed(2) + ' tr' : '...'}
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-400 font-bold">Bạc quy đổi</span>
                  <span className="text-blue-400 font-mono font-black">
                    {marketData ? ((marketData.xagPrice * marketData.usdVnd * 1.205) / 1000000).toFixed(2) + ' tr' : '...'}
                  </span>
               </div>
            </div>
            
            <div className="md:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-700/30 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex gap-12">
                  <div>
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System State</div>
                     <div className="text-emerald-400 font-black text-base tracking-tighter">SECURE & ACTIVE</div>
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Data Feed</div>
                     <div className="text-white font-black text-base tracking-tighter">GOOGLE FINANCE / TV</div>
                  </div>
               </div>
               <div className="text-right flex flex-col items-end">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Worker Version</div>
                  <div className="text-slate-400 font-mono text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700">GMA-2025-V1.2.5-ULTRA</div>
               </div>
            </div>
        </div>
      </div>
      
      <div id="chat-widget-container">
        <ChatWidget />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={loadData}
      />
      
      <Footer />
    </div>
  );
};

export default App;