import React, { useState, useEffect, useRef } from 'react';
import PriceCard from './components/PriceCard';
import MarketChart from './components/MarketChart';
import AnalysisPanel from './components/AnalysisPanel';
import NewsSection from './components/NewsSection';
import LocalGoldTable from './components/LocalGoldTable';
import Footer from './components/Footer';
import MarketSnapshot from './components/MarketSnapshot';
import AdvancedTechnicals from './components/AdvancedTechnicals';
import DetailedAnalysis from './components/DetailedAnalysis';
import LoadingIcon from './components/LoadingIcon';
import ChatWidget from './components/ChatWidget';
import SettingsModal from './components/SettingsModal';
import { useToast } from './contexts/ToastContext';
import { MarketData, AnalysisReport } from './types';
import { fetchAllMarketData } from './services/marketDataFetcher';
import { generateMarketAnalysis } from './services/ai';
import { CACHE_TTL_SECONDS } from './utils/cache';
import { ANALYSIS_CONSTANTS } from './utils/constants';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createChart } from 'lightweight-charts';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPngGenerating, setIsPngGenerating] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      const data = await fetchAllMarketData();
      setMarketData(data);

      // Parallel fetch for analysis
      generateMarketAnalysis(data)
        .then(analysis => setReport(analysis))
        .catch(err => {
          console.error("Analysis generation failed:", err);
          showToast('Không thể tạo bài phân tích AI.', 'error');
        });

    } catch (error) {
      console.error("Error loading data:", error);
      showToast('Lỗi khi tải dữ liệu thị trường.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  // PDF & PNG Export Logic (Keeping original implementation logic)
  const generateExportContainer = async (data: MarketData, analysis: AnalysisReport) => {
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.top = '-9999px';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '1100px';
    exportContainer.style.backgroundColor = '#020617'; // Updated background
    exportContainer.style.color = '#e2e8f0';
    exportContainer.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
    exportContainer.style.padding = '40px';
    exportContainer.className = 'export-container';

    // Clone the main content but exclude interactive elements
    const content = document.getElementById('root')?.cloneNode(true) as HTMLElement;

    // Remove unwanted elements
    const buttons = content.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());
    const chatWidget = content.querySelector('#chat-widget-container');
    if (chatWidget) chatWidget.remove();
    const settingsModal = content.querySelector('.fixed.inset-0.z-50'); // Modal
    if (settingsModal) settingsModal.remove();

    exportContainer.appendChild(content);
    document.body.appendChild(exportContainer);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 1500));
    return exportContainer;
  };

  const handleDownloadPdf = async () => {
    if (!marketData || !report) return;
    setIsPdfGenerating(true);
    showToast('Đang tạo báo cáo PDF...', 'info');

    try {
      const container = await generateExportContainer(marketData, report);
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GMA_Report_${new Date().toISOString().slice(0,10)}.pdf`);

      document.body.removeChild(container);
      showToast('Tải báo cáo PDF thành công!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast('Lỗi khi tạo PDF.', 'error');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
     if (!marketData || !report) return;
     setIsPngGenerating(true);
     showToast('Đang chụp ảnh báo cáo...', 'info');

     try {
       const container = await generateExportContainer(marketData, report);
       const canvas = await html2canvas(container, {
         scale: 2,
         useCORS: true,
         backgroundColor: '#020617',
         logging: false
       });

       const link = document.createElement('a');
       link.download = `GMA_Snapshot_${new Date().toISOString().slice(0,10)}.png`;
       link.href = canvas.toDataURL('image/png');
       link.click();

       document.body.removeChild(container);
       showToast('Lưu ảnh thành công!', 'success');
     } catch (error) {
       console.error('PNG generation failed:', error);
       showToast('Lỗi khi lưu ảnh.', 'error');
     } finally {
       setIsPngGenerating(false);
     }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans relative">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[180px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-emerald-900/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                 Live Market Data
               </span>
               <span className="text-slate-500 text-xs font-mono tracking-tight">{marketData?.lastUpdated}</span>
             </div>

             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">GOLD</span> MARKET <span className="text-slate-600 font-light">ANALYST</span>
             </h1>

             <p className="text-slate-400 font-medium tracking-wide text-sm flex items-center gap-2">
               <span className="w-2 h-0.5 bg-blue-500"></span>
               Hệ thống Phân tích & Định giá Vàng 24/7 v{ANALYSIS_CONSTANTS.APP_VERSION}
             </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-white transition-all active:scale-95 backdrop-blur-sm"
                title="Cài đặt"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
             </button>

             <div className="h-8 w-px bg-slate-800 mx-1"></div>

             <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating || isPngGenerating || loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 text-slate-300 font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95 backdrop-blur-sm"
             >
                {isPdfGenerating ? (
                  <LoadingIcon size={16} />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" /></svg>
                )}
                <span>Report PDF</span>
             </button>
             <button
                onClick={handleDownloadPng}
                disabled={isPdfGenerating || isPngGenerating || loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 hover:shadow-blue-600/30"
             >
                {isPngGenerating ? (
                  <LoadingIcon size={16} className="text-white" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                <span>Snapshot</span>
             </button>
          </div>
        </header>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
          <PriceCard 
            title="XAU/USD Spot" 
            value={marketData?.xauPrice ? `$${marketData.xauPrice.toLocaleString()}` : '...'}
            subValue="Global Spot Gold"
            color="gold"
            icon={<span>🏆</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="XAG/USD Spot"
            value={marketData?.xagPrice ? `$${marketData.xagPrice.toFixed(2)}` : '...'}
            subValue="Global Silver"
            color="blue"
            icon={<span>🥈</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="SJC Vietnam" 
            value={marketData?.sjcSell ? `${marketData.sjcSell} M` : '...'}
            subValue={marketData?.sjcBuy ? `Buy: ${marketData.sjcBuy}` : 'Buy: ...'}
            color="red"
            icon={<span>🇻🇳</span>}
            isLoading={loading}
          />
          <PriceCard
            title="Ring Gold 9999"
            value={marketData?.ringGoldSell ? `${marketData.ringGoldSell} M` : '...'}
            subValue={marketData?.ringGoldBuy ? `Buy: ${marketData.ringGoldBuy}` : 'Buy: ...'}
            color="gold"
            icon={<span>💍</span>}
            isLoading={loading}
          />
          <PriceCard
            title="Silver Domestic"
            value={marketData?.silverSell ? `${marketData.silverSell} M` : '...'}
            subValue={marketData?.silverBuy ? `Buy: ${marketData.silverBuy}` : 'Buy: ...'}
            color="blue"
            icon={<span>🌑</span>}
            isLoading={loading}
          />
          <PriceCard 
            title="Spread/Premium"
            value={marketData?.sjcSell && marketData?.spread !== 0 ? `+${marketData.spread.toFixed(2)} M` : '...'}
            subValue={marketData?.sjcSell ? (marketData.spread > 5 ? "⚠️ High Risk" : "✅ Stable") : "Calculating..."}
            color={marketData?.sjcSell && marketData?.spread > 5 ? "red" : "green"}
            icon={<span>📊</span>}
            isLoading={loading}
          />
        </div>

        {/* NEW: Market Snapshot Pulse Section */}
        {report && marketData && <MarketSnapshot report={report} marketData={marketData} />}

        {/* Vietnamese Gold Prices Comparison */}
        <div className="mb-10">
           {marketData ? (
             <LocalGoldTable data={marketData} isLoading={loading} />
           ) : (
             <div className="h-40 bg-slate-900/40 rounded-2xl border border-slate-800/50 flex items-center justify-center animate-pulse backdrop-blur-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                   <LoadingIcon size={20} /> Đang tải dữ liệu thị trường...
                </span>
             </div>
           )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 mb-10">
          <div className="lg:col-span-3 space-y-8">
            <MarketChart 
               supportLevel={report?.entryPointBuy}
               resistanceLevel={report?.entryPointSell}
            />
            {report && <AdvancedTechnicals signals={report.technicalSignals} />}
          </div>

          <div className="lg:col-span-1 min-h-[600px] flex flex-col">
             {report ? (
               <AnalysisPanel 
                 report={report} 
                 isLoading={loading} 
                 onRefresh={loadData} 
               />
             ) : (
                <div className="flex-1 bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center text-slate-500 p-10 text-center backdrop-blur-sm">
                   <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                   <h3 className="text-white font-bold uppercase tracking-widest mb-2 text-sm">System Analysis Running...</h3>
                   <p className="text-xs">Processing global macro data...</p>
                </div>
             )}
          </div>
        </div>

        <div className="mb-12">
          {report && <DetailedAnalysis report={report} />}
          {!report && loading && (
             <div className="h-64 bg-slate-800/40 rounded-2xl border border-slate-700/50 animate-pulse flex items-center justify-center backdrop-blur-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                   <LoadingIcon size={20} /> Generating Comprehensive Report...
                </span>
             </div>
          )}
        </div>

        {/* News Section */}
        <div className="mb-16">
           <NewsSection news={report?.news || []} isLoading={loading} />
        </div>

        {/* Secondary Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Foreign Exchange</div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">USD/VND</span>
                  <span className="text-white font-mono font-bold">{marketData?.usdVnd.toLocaleString() || '...'} ₫</span>
               </div>
               <div className="flex justify-between items-center text-sm mt-4">
                  <span className="text-slate-400 font-medium">World Gold Conv.</span>
                  <span className="text-yellow-500 font-mono font-bold text-lg">
                    {marketData ? ((marketData.xauPrice * marketData.usdVnd * ANALYSIS_CONSTANTS.GOLD_CONVERSION_FACTOR) / 1000000).toFixed(2) + ' M' : '...'}
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-400 font-medium">Silver Conv.</span>
                  <span className="text-blue-400 font-mono font-bold">
                    {marketData ? ((marketData.xagPrice * marketData.usdVnd * 1.205) / 1000000).toFixed(2) + ' M' : '...'}
                  </span>
               </div>
            </div>
            
            <div className="md:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex gap-12">
                  <div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">System State</div>
                     <div className="text-emerald-400 font-bold text-base tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        ONLINE & SECURE
                     </div>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Data Source</div>
                     <div className="text-white font-bold text-base tracking-tight">OANDA / G-FINANCE</div>
                  </div>
               </div>
               <div className="text-right flex flex-col items-end">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Build Version</div>
                  <div className="text-slate-400 font-mono text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700">GMA-2025-V2.0-PRO</div>
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
