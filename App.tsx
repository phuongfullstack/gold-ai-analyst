import React, { useEffect, useState } from 'react';
import PriceCard from './components/PriceCard';
import MarketChart from './components/MarketChart';
import AnalysisPanel from './components/AnalysisPanel';
import AdvancedTechnicals from './components/AdvancedTechnicals';
import DetailedAnalysis from './components/DetailedAnalysis';
import MarketSnapshot from './components/MarketSnapshot';
import ChatWidget from './components/ChatWidget';
import SettingsModal from './components/SettingsModal';
import { fetchMarketAnalysis } from './services/geminiService';
import { MarketData, AnalysisReport } from './types';
import { useToast } from './contexts/ToastContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPngGenerating, setIsPngGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketAnalysis();
      setMarketData(data.marketData);
      setReport(data.report);

      if (data.report.prediction.includes("Safe Mode")) {
         showToast("Đang chạy ở chế độ Safe Mode (Không có AI)", "warning");
      } else {
         showToast("Dữ liệu thị trường đã được cập nhật", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể tải dữ liệu thị trường. Vui lòng kiểm tra kết nối.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      loadData();
    }, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleChartPlaceholder = (show: boolean, reportData: AnalysisReport | null, mData: MarketData | null) => {
    const container = document.getElementById('tradingview_widget_xauusd');
    if (!container) return;

    if (show && reportData && mData) {
      const placeholder = document.createElement('div');
      placeholder.id = 'export-chart-placeholder';
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      placeholder.style.backgroundColor = '#0f172a';
      placeholder.style.display = 'flex';
      placeholder.style.flexDirection = 'column';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.position = 'absolute';
      placeholder.style.top = '0';
      placeholder.style.left = '0';
      placeholder.style.zIndex = '50';
      placeholder.style.padding = '20px';
      
      const sigs = reportData.technicalSignals;
      const sentiment = sigs.rsi > 60 ? 'BULLISH' : sigs.rsi < 40 ? 'BEARISH' : 'NEUTRAL';
      const sentimentColor = sentiment === 'BULLISH' ? '#10b981' : sentiment === 'BEARISH' ? '#f43f5e' : '#eab308';

      placeholder.innerHTML = `
        <div style="border: 1px solid #334155; border-radius: 24px; padding: 40px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); width: 95%; height: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; color: white; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <div>
                <div style="color: #eab308; font-size: 28px; font-weight: 900; letter-spacing: 2px;">MARKET SNAPSHOT</div>
                <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Technical Confluence Report</div>
              </div>
              <div style="background: ${sentimentColor}20; border: 1px solid ${sentimentColor}50; padding: 10px 20px; border-radius: 12px; text-align: right;">
                <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase;">SENTIMENT</div>
                <div style="color: ${sentimentColor}; font-size: 24px; font-weight: 900;">${sentiment}</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
              <div style="background: #0f172a; padding: 20px; border-radius: 16px; border-left: 4px solid #3b82f6;">
                <div style="color: #475569; font-size: 10px; font-weight: 900; text-transform: uppercase;">CHỈ SỐ SỨC MẠNH (RSI)</div>
                <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
                   <div style="font-size: 32px; font-weight: 900;">${sigs.rsi}</div>
                   <div style="flex: 1; height: 6px; background: #1e293b; border-radius: 3px; position: relative;">
                      <div style="position: absolute; left: ${sigs.rsi}%; width: 12px; height: 12px; background: white; border-radius: 50%; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px white;"></div>
                   </div>
                </div>
              </div>
              <div style="background: #0f172a; padding: 20px; border-radius: 16px; border-left: 4px solid #8b5cf6;">
                <div style="color: #475569; font-size: 10px; font-weight: 900; text-transform: uppercase;">XU HƯỚNG TRUNG HẠN (MA)</div>
                <div style="margin-top: 10px; font-size: 18px; font-weight: 800; color: ${sigs.ma50 === 'ABOVE' ? '#10b981' : '#f43f5e'}">
                  ${sigs.ma50 === 'ABOVE' ? '▲ GIÁ TRÊN MA50' : '▼ GIÁ DƯỚI MA50'}
                </div>
                <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Cấu trúc thị trường hiện tại</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
               <div style="background: rgba(16, 185, 129, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.1);">
                  <div style="color: #10b981; font-size: 10px; font-weight: 900; text-transform: uppercase;">HỖ TRỢ CHIẾN LƯỢC</div>
                  <div style="font-size: 28px; font-weight: 900; margin-top: 5px; color: #10b981;">$${sigs.support}</div>
               </div>
               <div style="background: rgba(244, 63, 94, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(244, 63, 94, 0.1);">
                  <div style="color: #f43f5e; font-size: 10px; font-weight: 900; text-transform: uppercase;">KHÁNG CỰ CHIẾN LƯỢC</div>
                  <div style="font-size: 28px; font-weight: 900; margin-top: 5px; color: #f43f5e;">$${sigs.resistance}</div>
               </div>
            </div>
          </div>

          <div style="border-top: 1px solid #334155; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="max-width: 60%;">
               <div style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">TÓM TẮT HÀNH ĐỘNG</div>
               <div style="color: #fff; font-size: 14px; font-weight: 600; line-height: 1.5;">${reportData.technicalSummary.substring(0, 150)}...</div>
            </div>
            <div style="text-align: right;">
               <div style="color: #475569; font-size: 9px; font-weight: 900; font-family: monospace;">AIA TERMINAL PROTOCOL // ${new Date().toISOString()}</div>
            </div>
          </div>
        </div>
      `;
      
      const prevPosition = container.style.position;
      container.style.position = 'relative';
      container.dataset.prevPosition = prevPosition;
      container.appendChild(placeholder);
    } else {
      const placeholder = document.getElementById('export-chart-placeholder');
      if (placeholder) placeholder.remove();
      if (container.dataset.prevPosition) {
         container.style.position = container.dataset.prevPosition;
      }
    }
  };

  const prepareForExport = () => {
    const chatWidget = document.getElementById('chat-widget-container');
    if (chatWidget) chatWidget.style.display = 'none';
    toggleChartPlaceholder(true, report, marketData);
    document.body.classList.add('exporting');
  };

  const cleanupExport = () => {
    const chatWidget = document.getElementById('chat-widget-container');
    if (chatWidget) chatWidget.style.display = 'block';
    toggleChartPlaceholder(false, null, null);
    document.body.classList.remove('exporting');
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      prepareForExport();
      const element = document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: 1600,
      });
      cleanupExport();
      
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
    } catch (err) {
      console.error(err);
      cleanupExport();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsPngGenerating(true);
    try {
      prepareForExport();
      const element = document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: 1600,
      });
      cleanupExport();
      const link = document.createElement('a');
      link.download = `Gold_AI_Report_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      cleanupExport();
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
               <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black rounded uppercase tracking-widest">Live Terminal</span>
               <span className="text-slate-500 text-sm font-mono tracking-tighter">{marketData?.lastUpdated}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
              <span className="text-yellow-500">GOLD</span> AI ANALYST
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Neural Engine v1.2.5 • Detailed Snapshot Protocol
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
                {isPdfGenerating ? '...' : 'PDF Report'}
             </button>
             <button
                onClick={handleDownloadPng}
                disabled={isPdfGenerating || isPngGenerating || loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
             >
                {isPngGenerating ? '...' : 'Snapshot'}
             </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-6 mb-10">
          <PriceCard 
            title="XAU/USD Spot" 
            value={marketData ? `$${marketData.xauPrice.toLocaleString()}` : '...'}
            subValue="Thế giới (Global)"
            color="gold"
            icon={<span>🏆</span>}
          />
          <PriceCard 
            title="DXY Index" 
            value={marketData ? marketData.dxyValue.toFixed(3) : '...'}
            subValue="Đô-la Mỹ (Strength)"
            color="blue"
            icon={<span>💵</span>}
          />
          <PriceCard 
            title="SJC Vietnam" 
            value={marketData ? `${marketData.sjcSell} tr` : '...'}
            subValue={`Mua: ${marketData?.sjcBuy || '...'}`}
            color="red"
            icon={<span>🇻🇳</span>}
          />
          <PriceCard
            title="Vàng Nhẫn 9999"
            value={marketData ? `${marketData.ringGoldSell || '...'} tr` : '...'}
            subValue={`Mua: ${marketData?.ringGoldBuy || '...'}`}
            color="gold"
            icon={<span>💍</span>}
          />
          <PriceCard 
            title="Premium/Spread" 
            value={marketData ? `+${marketData.spread.toFixed(2)} tr` : '...'}
            subValue={marketData?.spread && marketData.spread > 5 ? "⚠️ Rủi ro cao" : "✅ Ổn định"}
            color={marketData?.spread && marketData.spread > 5 ? "red" : "green"}
            icon={<span>📊</span>}
          />
        </div>

        {/* NEW: Market Snapshot Pulse Section */}
        {report && marketData && <MarketSnapshot report={report} marketData={marketData} />}

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
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Synthesizing detailed trends...</span>
             </div>
          )}
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
                    {marketData ? ((marketData.xauPrice * marketData.usdVnd * 1.205) / 1000000).toFixed(2) + ' tr' : '...'}
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
                  <div className="text-slate-400 font-mono text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700">AIA-2025-V1.2.5-ULTRA</div>
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
    </div>
  );
};

export default App;