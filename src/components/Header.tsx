import React from 'react';
import { MarketData } from '../types';

interface HeaderProps {
  marketData: MarketData | null;
  loading: boolean;
  isPdfGenerating: boolean;
  isPngGenerating: boolean;
  onDownloadPdf: () => void;
  onDownloadPng: () => void;
}

const Header: React.FC<HeaderProps> = ({
  marketData,
  loading,
  isPdfGenerating,
  isPngGenerating,
  onDownloadPdf,
  onDownloadPng
}) => {
  return (
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
            onClick={onDownloadPdf}
            disabled={isPdfGenerating || isPngGenerating || loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 font-bold text-xs uppercase tracking-widest transition-all hover:border-slate-500 disabled:opacity-30 active:scale-95"
         >
            {isPdfGenerating ? '...' : 'PDF Report'}
         </button>
         <button
            onClick={onDownloadPng}
            disabled={isPdfGenerating || isPngGenerating || loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
         >
            {isPngGenerating ? '...' : 'Snapshot'}
         </button>
      </div>
    </div>
  );
};

export default Header;
