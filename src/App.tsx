import React from 'react';
import MainLayout from './layouts/MainLayout';
import Header from './components/Header';
import PriceCard from './components/PriceCard';
import MarketChart from './components/MarketChart';
import AnalysisPanel from './components/AnalysisPanel';
import AdvancedTechnicals from './components/AdvancedTechnicals';
import DetailedAnalysis from './components/DetailedAnalysis';
import MarketSnapshot from './components/MarketSnapshot';
import { useMarketData } from './hooks/useMarketData';
import { useExportReport } from './hooks/useExportReport';

const App: React.FC = () => {
  const { marketData, report, loading, error, refresh } = useMarketData();
  const {
    isPdfGenerating,
    isPngGenerating,
    handleDownloadPdf,
    handleDownloadPng
  } = useExportReport(marketData, report);

  return (
    <MainLayout>
        <Header
          marketData={marketData}
          loading={loading}
          isPdfGenerating={isPdfGenerating}
          isPngGenerating={isPngGenerating}
          onDownloadPdf={handleDownloadPdf}
          onDownloadPng={handleDownloadPng}
        />

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">⚠️</div>
            <div className="font-bold">{error}</div>
          </div>
        )}

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
                 onRefresh={refresh}
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
    </MainLayout>
  );
};

export default App;
